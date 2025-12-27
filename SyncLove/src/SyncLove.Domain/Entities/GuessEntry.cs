namespace SyncLove.Domain.Entities;

/// <summary>
/// Represents a single guess entry from a player during an emotion round.
/// </summary>
public class GuessEntry
{
    /// <summary>Unique identifier for this guess</summary>
    public Guid Id { get; set; } = Guid.NewGuid();
    
    /// <summary>Player who made the guess</summary>
    public Guid PlayerId { get; set; }
    
    /// <summary>The guessed text</summary>
    public required string GuessText { get; set; }
    
    /// <summary>Whether this was an exact match</summary>
    public bool IsExactMatch { get; set; }
    
    /// <summary>Emotional resonance score (0-100) for close matches</summary>
    public int ResonanceScore { get; set; }
    
    /// <summary>When the guess was made (for speed scoring)</summary>
    public DateTime GuessedAt { get; set; } = DateTime.UtcNow;
}
