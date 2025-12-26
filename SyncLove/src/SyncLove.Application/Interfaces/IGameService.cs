using SyncLove.Application.Common;
using SyncLove.Application.DTOs.Game;

namespace SyncLove.Application.Interfaces;

/// <summary>
/// Game session management interface.
/// </summary>
public interface IGameService
{
    /// <summary>Create a new game session.</summary>
    Task<Result<GameSessionDto>> CreateSessionAsync(Guid userId, string gameType);
    
    /// <summary>Join an existing game session.</summary>
    Task<Result<GameSessionDto>> JoinSessionAsync(Guid sessionId, Guid userId);
    
    /// <summary>Get a game session by ID.</summary>
    Task<Result<GameSessionDto>> GetSessionAsync(Guid sessionId);
    
    /// <summary>Update game state.</summary>
    Task<Result<GameSessionDto>> UpdateGameStateAsync(Guid sessionId, Guid userId, string gameState);
    
    /// <summary>Complete a game session with a winner.</summary>
    Task<Result<GameSessionDto>> CompleteGameAsync(Guid sessionId, Guid? winnerId);
    
    /// <summary>Get active sessions for a user.</summary>
    Task<Result<IEnumerable<GameSessionDto>>> GetUserSessionsAsync(Guid userId);
}
