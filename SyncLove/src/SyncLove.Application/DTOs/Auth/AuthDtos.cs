namespace SyncLove.Application.DTOs.Auth;

/// <summary>
/// Request to register a new user.
/// </summary>
public record RegisterRequest(
    string Email,
    string Password,
    string DisplayName
);

/// <summary>
/// Request to login.
/// </summary>
public record LoginRequest(
    string Email,
    string Password
);

/// <summary>
/// Request to refresh an access token.
/// </summary>
public record RefreshTokenRequest(
    string RefreshToken
);

/// <summary>
/// Authentication response with tokens and user info.
/// </summary>
public record AuthResponse(
    Guid UserId,
    string Email,
    string DisplayName,
    string? AvatarUrl,
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpires
);

/// <summary>
/// Basic user info DTO.
/// </summary>
public record UserDto(
    Guid Id,
    string Email,
    string DisplayName,
    string? AvatarUrl,
    Guid? PartnerId,
    bool IsOnline,
    DateTime? LastOnlineAt
);
