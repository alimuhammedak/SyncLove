namespace SyncLove.Application.Interfaces;

/// <summary>
/// Service for generating Agora.io RTC tokens.
/// </summary>
public interface IAgoraTokenService
{
    /// <summary>
    /// Generates an RTC token for joining a voice channel.
    /// </summary>
    /// <param name="channelName">The channel name (lobby/session ID)</param>
    /// <param name="userId">The user ID</param>
    /// <param name="expirationTimeInSeconds">Token expiration time (default: 3600)</param>
    /// <returns>The RTC token</returns>
    string GenerateRtcToken(string channelName, string userId, int expirationTimeInSeconds = 3600);
}
