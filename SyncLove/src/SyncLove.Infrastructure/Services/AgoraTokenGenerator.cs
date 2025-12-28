using System.Security.Cryptography;
using System.Text;

namespace SyncLove.Infrastructure.Services;

/// <summary>
/// A self-contained utility class to generate Agora RTC tokens (006 version).
/// This implementation follows Agora's binary packing protocol.
/// </summary>
public static class AgoraTokenGenerator
{
    public enum Role
    {
        Attendee = 0,
        Publisher = 1,
        Subscriber = 2,
        Admin = 101
    }

    /// <summary>
    /// Generates an Agora RTC token for a specific channel and user using a numeric UID.
    /// </summary>
    public static string BuildTokenWithUid(
        string appId,
        string appCertificate,
        string channelName,
        uint uid,
        Role role,
        uint privilegeExpiredTs)
    {
        uint ts = (uint)DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        uint salt = (uint)new Random().Next();

        // 1. Prepare message content
        byte[] messageContent;
        using (var ms = new MemoryStream())
        using (var bw = new BinaryWriter(ms))
        {
            // Pack PrivilegeMessage
            bw.Write((ushort)salt);
            bw.Write((uint)ts);
            
            // Map of privileges: 1 (JoinChannel) -> expiredTs
            bw.Write((ushort)1); // Map size
            bw.Write((ushort)1); // Key: JoinChannel
            bw.Write(privilegeExpiredTs); // Value
            
            bw.Flush();
            messageContent = ms.ToArray();
        }

        // 2. Generate Signature
        byte[] signature;
        using (var ms = new MemoryStream())
        using (var bw = new BinaryWriter(ms))
        {
            bw.Write(Encoding.UTF8.GetBytes(appId));
            bw.Write(Encoding.UTF8.GetBytes(channelName));
            bw.Write(Encoding.UTF8.GetBytes(uid.ToString())); // Use string representation for signature
            bw.Write(messageContent);
            bw.Flush();

            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(appCertificate)))
            {
                signature = hmac.ComputeHash(ms.ToArray());
            }
        }

        // 3. CRC
        uint crcChannelName = Crc32(channelName);
        uint crcUid = uid; // For numeric UIDs, CRC is often the UID itself in some 006 variants, or we keep Crc32(uid.ToString())

        // 4. Pack final content
        byte[] finalContent;
        using (var ms = new MemoryStream())
        using (var bw = new BinaryWriter(ms))
        {
            // Pack Content
            WriteBytes(bw, signature);
            bw.Write(crcChannelName);
            bw.Write(crcUid);
            WriteBytes(bw, messageContent);
            
            bw.Flush();
            finalContent = ms.ToArray();
        }

        // 5. Build final string: version + appId + base64(content)
        // Switch to "006" prefix as it matches the binary packing protocol implemented above
        return "006" + appId + Convert.ToBase64String(finalContent);
    }

    private static void WriteBytes(BinaryWriter bw, byte[] bytes)
    {
        bw.Write((ushort)bytes.Length);
        bw.Write(bytes);
    }

    private static uint Crc32(string text)
    {
        var bytes = Encoding.UTF8.GetBytes(text);
        uint crc = 0xFFFFFFFF;
        foreach (byte b in bytes)
        {
            crc ^= b;
            for (int i = 0; i < 8; i++)
            {
                crc = (crc >> 1) ^ (0xEDB88320 & (uint)-(int)(crc & 1));
            }
        }
        return ~crc;
    }
}
