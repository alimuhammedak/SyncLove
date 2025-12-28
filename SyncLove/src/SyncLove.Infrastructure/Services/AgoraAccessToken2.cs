using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace SyncLove.Infrastructure.Services;

/// <summary>
/// Implements Agora Access Token v2 (007) protocol.
/// </summary>
public class AgoraAccessToken2
{
    private const string Version = "007";
    
    public string AppId { get; private set; }
    public string AppCertificate { get; private set; }
    public uint IssueTs { get; private set; }
    public uint Expire { get; private set; }
    public uint Salt { get; private set; }
    public List<Service> Services { get; private set; } = new();

    public AgoraAccessToken2(string appId, string appCertificate, uint expire)
    {
        AppId = appId;
        AppCertificate = appCertificate;
        Expire = expire;
        IssueTs = (uint)DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        Salt = (uint)new Random().Next(1, 99999999);
    }

    public void AddService(Service service)
    {
        Services.Add(service);
    }

    public string Build()
    {
        var buf = new ByteBuf();
        buf.Put(AppId);
        buf.Put(IssueTs);
        buf.Put(Expire);
        buf.Put(Salt);
        buf.Put((ushort)Services.Count);
        
        foreach (var service in Services)
        {
            service.Pack(buf);
        }

        byte[] sign = GenerateSignature(AppCertificate, buf.ToBytes());
        
        var finalBuf = new ByteBuf();
        finalBuf.Put(buf.ToBytes()); // Content
        finalBuf.Put(sign);          // Signature

        return Version + Convert.ToBase64String(finalBuf.ToBytes());
    }

    private static byte[] GenerateSignature(string appCertificate, byte[] content)
    {
        using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(appCertificate)))
        {
            return hmac.ComputeHash(content);
        }
    }
}

public abstract class Service
{
    public ushort Type { get; protected set; }
    public Dictionary<ushort, uint> Privileges { get; } = new();

    public abstract void Pack(ByteBuf buf);

    public void AddPrivilege(ushort privilege, uint expire)
    {
        Privileges[privilege] = expire;
    }
}

public class ServiceRtc : Service
{
    public const ushort SERVICE_TYPE = 1;
    public const ushort PRIVILEGE_JOIN_CHANNEL = 1;
    public const ushort PRIVILEGE_PUBLISH_AUDIO_STREAM = 2;
    public const ushort PRIVILEGE_PUBLISH_VIDEO_STREAM = 3;
    public const ushort PRIVILEGE_PUBLISH_DATA_STREAM = 4;

    public string ChannelName { get; private set; }
    public string Uid { get; private set; }

    public ServiceRtc(string channelName, string uid)
    {
        Type = SERVICE_TYPE;
        ChannelName = channelName;
        Uid = uid;
    }

    public override void Pack(ByteBuf buf)
    {
        buf.Put(Type);
        
        var contentBuf = new ByteBuf();
        contentBuf.Put(ChannelName);
        contentBuf.Put(Uid);
        contentBuf.Put((ushort)Privileges.Count);
        
        foreach (var kvp in Privileges.OrderBy(k => k.Key))
        {
            contentBuf.Put(kvp.Key);
            contentBuf.Put(kvp.Value);
        }

        var contentBytes = contentBuf.ToBytes();
        buf.Put((ushort)contentBytes.Length);
        buf.Put(contentBytes);
    }
}

public class ByteBuf
{
    private readonly MemoryStream _stream = new();
    private readonly BinaryWriter _writer;

    public ByteBuf()
    {
        _writer = new BinaryWriter(_stream);
    }

    public void Put(ushort v) => _writer.Write(v); // BinaryWriter uses little-endian by default
    public void Put(uint v) => _writer.Write(v);
    
    public void Put(string v)
    {
        byte[] bytes = Encoding.UTF8.GetBytes(v);
        _writer.Write((ushort)bytes.Length);
        _writer.Write(bytes);
    }

    public void Put(byte[] v)
    {
        _writer.Write(v);
    }

    public byte[] ToBytes() => _stream.ToArray();
}
