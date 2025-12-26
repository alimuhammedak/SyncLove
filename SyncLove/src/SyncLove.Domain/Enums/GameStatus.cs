namespace SyncLove.Domain.Enums;

/// <summary>
/// Status of a game session.
/// </summary>
public enum GameStatus
{
    /// <summary>Waiting for players to join.</summary>
    Waiting = 0,
    
    /// <summary>Game is currently in progress.</summary>
    InProgress = 1,
    
    /// <summary>Game has been completed.</summary>
    Completed = 2,
    
    /// <summary>Game was cancelled or abandoned.</summary>
    Cancelled = 3
}
