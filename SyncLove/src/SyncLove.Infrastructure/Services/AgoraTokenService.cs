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
        uint expirationTimestamp = (uint)(DateTimeOffset.UtcNow.ToUnixTimeSeconds() + expirationTimeInSeconds);
        
        return AgoraTokenGenerator.BuildTokenWithUid(
            _appId,
            _appCertificate,
            channelName,
            userId,
            AgoraTokenGenerator.Role.Publisher,
            expirationTimestamp
        );
    }

    /// <summary>
    /// Gets the App ID for client-side use.
    /// </summary>
    public string GetAppId() => _appId;
}
