using SyncLove.Domain.Enums;

namespace SyncLove.Domain.Entities;

/// <summary>
/// Represents a real-time game session between two players.
/// </summary>
public class GameSession : BaseEntity
{
    /// <summary>Type of game (e.g., "hangman", "drawing", "quiz").</summary>
    public required string GameType { get; set; }
    
    /// <summary>ID of the first player (session creator).</summary>
    public Guid Player1Id { get; set; }
    
    /// <summary>ID of the second player (may be null if waiting for partner).</summary>
    public Guid? Player2Id { get; set; }
    
    /// <summary>JSON-serialized game state.</summary>
    public string GameState { get; set; } = "{}";
    
    /// <summary>Current status of the game session.</summary>
    public GameStatus Status { get; set; } = GameStatus.Waiting;
    
    /// <summary>ID of the winner (null if game not finished or draw).</summary>
    public Guid? WinnerId { get; set; }
    
    /// <summary>When the game was completed.</summary>
    public DateTime? CompletedAt { get; set; }
}
