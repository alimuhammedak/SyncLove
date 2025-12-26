using SyncLove.Application.Common;
using SyncLove.Application.DTOs.Auth;

namespace SyncLove.Application.Interfaces;

/// <summary>
/// Authentication service interface.
/// </summary>
public interface IAuthService
{
    /// <summary>Register a new user.</summary>
    Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request);
    
    /// <summary>Login with email and password.</summary>
    Task<Result<AuthResponse>> LoginAsync(LoginRequest request);
    
    /// <summary>Refresh an access token using a refresh token.</summary>
    Task<Result<AuthResponse>> RefreshTokenAsync(string refreshToken, string? ipAddress = null);
    
    /// <summary>Revoke a refresh token.</summary>
    Task<Result> RevokeTokenAsync(string refreshToken, string? ipAddress = null);
    
    /// <summary>Get current user info.</summary>
    Task<Result<UserDto>> GetCurrentUserAsync(Guid userId);
}
