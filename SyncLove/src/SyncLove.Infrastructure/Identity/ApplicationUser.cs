using Microsoft.AspNetCore.Identity;
using SyncLove.Domain.Entities;

namespace SyncLove.Infrastructure.Identity;

/// <summary>
/// Application user extending ASP.NET Core Identity with couple-specific properties.
/// </summary>
public class ApplicationUser : IdentityUser<Guid>
{
    /// <summary>Display name shown in the app.</summary>
    public string DisplayName { get; set; } = string.Empty;
    
    /// <summary>URL to user's avatar image.</summary>
    public string? AvatarUrl { get; set; }
    
    /// <summary>ID of the user's partner (couple link).</summary>
    public Guid? PartnerId { get; set; }
    
    /// <summary>Navigation property to partner.</summary>
    public ApplicationUser? Partner { get; set; }
    
    /// <summary>When the user account was created.</summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>When the user was last online.</summary>
    public DateTime? LastOnlineAt { get; set; }
    
    /// <summary>Whether the user is currently online.</summary>
    public bool IsOnline { get; set; }
    
    /// <summary>User's refresh tokens for JWT auth.</summary>
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
