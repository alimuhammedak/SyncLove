namespace SyncLove.Domain.Entities;

/// <summary>
/// Base entity with common properties for all domain entities.
/// </summary>
public abstract class BaseEntity
{
    /// <summary>Unique identifier.</summary>
    public Guid Id { get; set; }
    
    /// <summary>When the entity was created.</summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>When the entity was last updated.</summary>
    public DateTime? UpdatedAt { get; set; }
}
