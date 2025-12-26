using SyncLove.Domain.Enums;

namespace SyncLove.Application.DTOs.Game;

/// <summary>
/// Request to create a new game session.
/// </summary>
public record CreateGameRequest(
    string GameType
);

/// <summary>
/// Game session DTO.
/// </summary>
public record GameSessionDto(
    Guid Id,
    string GameType,
    Guid Player1Id,
    Guid? Player2Id,
    string GameState,
    GameStatus Status,
    DateTime CreatedAt,
    DateTime? CompletedAt,
    Guid? WinnerId
);

/// <summary>
/// Drawing point for real-time drawing sync.
/// </summary>
public record DrawingPoint(
    float X,
    float Y,
    string Color,
    float Size,
    bool IsNewStroke
);

/// <summary>
/// Game state update message.
/// </summary>
public record GameStateUpdate(
    Guid SessionId,
    string GameState,
    Guid UpdatedBy
);
