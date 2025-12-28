using SyncLove.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace SyncLove.Infrastructure.Services;

/// <summary>
/// Service for generating Agora.io RTC tokens.
/// Uses Agora's token generation algorithm.
/// </summary>
public class AgoraTokenService : IAgoraTokenService
{
    private readonly string _appId;
    private readonly string _appCertificate;

    public AgoraTokenService(IConfiguration configuration)
    {
        _appId = configuration["Agora:AppId"] ?? throw new ArgumentNullException("Agora:AppId is not configured");
        _appCertificate = configuration["Agora:AppCertificate"] ?? throw new ArgumentNullException("Agora:AppCertificate is not configured");
    }

    /// <inheritdoc/>
    public string GenerateRtcToken(string channelName, string userId, int expirationTimeInSeconds = 3600)
    {
        uint uid = ParseUserId(userId);
        uint expirationTimestamp = (uint)(DateTimeOffset.UtcNow.ToUnixTimeSeconds() + expirationTimeInSeconds);
        
        var tokenBuilder = new AgoraAccessToken2(_appId, _appCertificate, (uint)expirationTimeInSeconds);
        var serviceRtc = new ServiceRtc(channelName, uid.ToString());
        
        // Grant all privileges
        serviceRtc.AddPrivilege(ServiceRtc.PRIVILEGE_JOIN_CHANNEL, expirationTimestamp);
        serviceRtc.AddPrivilege(ServiceRtc.PRIVILEGE_PUBLISH_AUDIO_STREAM, expirationTimestamp);
        serviceRtc.AddPrivilege(ServiceRtc.PRIVILEGE_PUBLISH_VIDEO_STREAM, expirationTimestamp);
        serviceRtc.AddPrivilege(ServiceRtc.PRIVILEGE_PUBLISH_DATA_STREAM, expirationTimestamp);
        
        tokenBuilder.AddService(serviceRtc);
        
        return tokenBuilder.Build();
    }

    /// <summary>
    /// Parses a string user ID (GUID or numeric) into a uint UID for Agora.
    /// </summary>
    public static uint ParseUserId(string userId)
    {
        if (uint.TryParse(userId, out var uid))
            return uid;

        if (Guid.TryParse(userId, out var guid))
        {
            // Use the first 4 bytes of the GUID as a numeric UID
            return BitConverter.ToUInt32(guid.ToByteArray(), 0);
        }

        return 0; // Fallback for UID 0
    }

    /// <summary>
    /// Gets the App ID for client-side use.
    /// </summary>
    public string GetAppId() => _appId;
}
