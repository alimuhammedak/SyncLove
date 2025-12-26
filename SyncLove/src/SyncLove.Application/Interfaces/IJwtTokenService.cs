namespace SyncLove.Application.Interfaces;

/// <summary>
/// JWT token generation interface.
/// </summary>
public interface IJwtTokenService
{
    /// <summary>Generate an access token for a user.</summary>
    string GenerateAccessToken(Guid userId, string email, IEnumerable<string>? roles = null);
    
    /// <summary>Generate a refresh token.</summary>
    string GenerateRefreshToken();
    
    /// <summary>Get access token expiration time.</summary>
    DateTime GetAccessTokenExpiration();
    
    /// <summary>Get refresh token expiration time.</summary>
    DateTime GetRefreshTokenExpiration();
}
