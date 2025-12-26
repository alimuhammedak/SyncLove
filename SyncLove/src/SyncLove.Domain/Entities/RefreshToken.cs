namespace SyncLove.Domain.Entities;

/// <summary>
/// Represents a refresh token for JWT authentication.
/// </summary>
public class RefreshToken : BaseEntity
{
    /// <summary>The refresh token value.</summary>
    public required string Token { get; set; }
    
    /// <summary>ID of the user this token belongs to.</summary>
    public Guid UserId { get; set; }
    
    /// <summary>When this token expires.</summary>
    public DateTime ExpiresAt { get; set; }
    
    /// <summary>Whether this token has been revoked.</summary>
    public bool IsRevoked { get; set; }
    
    /// <summary>When this token was revoked (if applicable).</summary>
    public DateTime? RevokedAt { get; set; }
    
    /// <summary>IP address that created this token.</summary>
    public string? CreatedByIp { get; set; }
    
    /// <summary>IP address that revoked this token.</summary>
    public string? RevokedByIp { get; set; }
    
    /// <summary>Token that replaced this one (if rotated).</summary>
    public string? ReplacedByToken { get; set; }
    
    /// <summary>Check if this token is still active.</summary>
    public bool IsActive => !IsRevoked && DateTime.UtcNow < ExpiresAt;
}
