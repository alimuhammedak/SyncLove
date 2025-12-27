using SyncLove.Domain.Enums;

namespace SyncLove.Domain.Entities;

/// <summary>
/// Represents a single round in the Emotion Drawing game.
/// </summary>
public class EmotionRound
{
    /// <summary>Unique identifier for this round</summary>
    public Guid Id { get; set; } = Guid.NewGuid();
    
    /// <summary>The emotion/word to be drawn</summary>
    public required string Emotion { get; set; }
    
    /// <summary>Category of the emotion</summary>
    public required string Category { get; set; }
    
    /// <summary>Difficulty level</summary>
    public EmotionDifficulty Difficulty { get; set; }
    
    /// <summary>Player drawing this round</summary>
    public Guid DrawerId { get; set; }
    
    /// <summary>Canvas data (strokes in JSON format)</summary>
    public string CanvasData { get; set; } = "[]";
    
    /// <summary>Time limit in seconds</summary>
    public int TimeLimit { get; set; } = 60;
    
    /// <summary>When the round started</summary>
    public DateTime StartedAt { get; set; }
    
    /// <summary>When the round ended</summary>
    public DateTime? EndedAt { get; set; }
    
    /// <summary>All guesses made during this round</summary>
    public List<GuessEntry> Guesses { get; set; } = [];
    
    /// <summary>Whether the emotion was correctly guessed</summary>
    public bool WasGuessed { get; set; }
    
    /// <summary>Player who correctly guessed (if any)</summary>
    public Guid? WinnerId { get; set; }
}
