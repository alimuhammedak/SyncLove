using Microsoft.EntityFrameworkCore;
using SyncLove.Application.Common;
using SyncLove.Application.DTOs.Game;
using SyncLove.Application.Interfaces;
using SyncLove.Domain.Entities;
using SyncLove.Domain.Enums;
using SyncLove.Infrastructure.Data;

namespace SyncLove.Infrastructure.Services;

/// <summary>
/// Game session management service.
/// </summary>
public class GameService : IGameService
{
    private readonly AppDbContext _dbContext;
    
    public GameService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    
    public async Task<Result<GameSessionDto>> CreateSessionAsync(Guid userId, string gameType)
    {
        var session = new GameSession
        {
            GameType = gameType,
            Player1Id = userId,
            Status = GameStatus.Waiting,
            GameState = "{}"
        };
        
        _dbContext.GameSessions.Add(session);
        await _dbContext.SaveChangesAsync();
        
        return Result<GameSessionDto>.Success(MapToDto(session));
    }
    
    public async Task<Result<GameSessionDto>> JoinSessionAsync(Guid sessionId, Guid userId)
    {
        var session = await _dbContext.GameSessions.FindAsync(sessionId);
        if (session == null)
        {
            return Result<GameSessionDto>.Failure("Session not found.", "SESSION_NOT_FOUND");
        }
        
        if (session.Status != GameStatus.Waiting)
        {
            return Result<GameSessionDto>.Failure("Session is not accepting players.", "SESSION_NOT_WAITING");
        }
        
        if (session.Player1Id == userId)
        {
            return Result<GameSessionDto>.Failure("You cannot join your own session.", "SELF_JOIN");
        }
        
        session.Player2Id = userId;
        session.Status = GameStatus.InProgress;
        
        await _dbContext.SaveChangesAsync();
        
        return Result<GameSessionDto>.Success(MapToDto(session));
    }
    
    public async Task<Result<GameSessionDto>> GetSessionAsync(Guid sessionId)
    {
        var session = await _dbContext.GameSessions.FindAsync(sessionId);
        if (session == null)
        {
            return Result<GameSessionDto>.Failure("Session not found.", "SESSION_NOT_FOUND");
        }
        
        return Result<GameSessionDto>.Success(MapToDto(session));
    }
    
    public async Task<Result<GameSessionDto>> UpdateGameStateAsync(Guid sessionId, Guid userId, string gameState)
    {
        var session = await _dbContext.GameSessions.FindAsync(sessionId);
        if (session == null)
        {
            return Result<GameSessionDto>.Failure("Session not found.", "SESSION_NOT_FOUND");
        }
        
        if (session.Player1Id != userId && session.Player2Id != userId)
        {
            return Result<GameSessionDto>.Failure("You are not a player in this session.", "NOT_A_PLAYER");
        }
        
        if (session.Status != GameStatus.InProgress)
        {
            return Result<GameSessionDto>.Failure("Game is not in progress.", "GAME_NOT_ACTIVE");
        }
        
        session.GameState = gameState;
        await _dbContext.SaveChangesAsync();
        
        return Result<GameSessionDto>.Success(MapToDto(session));
    }
    
    public async Task<Result<GameSessionDto>> CompleteGameAsync(Guid sessionId, Guid? winnerId)
    {
        var session = await _dbContext.GameSessions.FindAsync(sessionId);
        if (session == null)
        {
            return Result<GameSessionDto>.Failure("Session not found.", "SESSION_NOT_FOUND");
        }
        
        session.Status = GameStatus.Completed;
        session.WinnerId = winnerId;
        session.CompletedAt = DateTime.UtcNow;
        
        await _dbContext.SaveChangesAsync();
        
        return Result<GameSessionDto>.Success(MapToDto(session));
    }
    
    public async Task<Result<IEnumerable<GameSessionDto>>> GetUserSessionsAsync(Guid userId)
    {
        var sessions = await _dbContext.GameSessions
            .Where(s => s.Player1Id == userId || s.Player2Id == userId)
            .Where(s => s.Status == GameStatus.Waiting || s.Status == GameStatus.InProgress)
            .OrderByDescending(s => s.CreatedAt)
            .Take(20)
            .ToListAsync();
        
        return Result<IEnumerable<GameSessionDto>>.Success(sessions.Select(MapToDto));
    }
    
    private static GameSessionDto MapToDto(GameSession session)
    {
        return new GameSessionDto(
            session.Id,
            session.GameType,
            session.Player1Id,
            session.Player2Id,
            session.GameState,
            session.Status,
            session.CreatedAt,
            session.CompletedAt,
            session.WinnerId
        );
    }
}
