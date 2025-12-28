using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SyncLove.Api.Controllers.Base;
using SyncLove.Application.DTOs.Game;
using SyncLove.Application.Interfaces;

namespace SyncLove.Api.Controllers;

/// <summary>
/// Game session management controller.
/// </summary>
[Route("api/[controller]")]
[Authorize]
public class GamesController : ApiControllerBase
{
    private readonly IGameService _gameService;
    
    public GamesController(IGameService gameService, ILogger<GamesController> logger) 
        : base(logger)
    {
        _gameService = gameService;
    }
    
    /// <summary>
    /// Create a new game session.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(GameSessionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GameSessionDto>> CreateSession([FromBody] CreateGameRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            Logger.LogWarning("CreateSession failed: Invalid user ID");
            return Unauthorized(new ApiErrorResponse("INVALID_USER", "Invalid user identity", HttpContext.TraceIdentifier));
        }

        Logger.LogInformation("Creating game session for user {UserId}, GameType: {GameType}", userId, request.GameType);
        
        var result = await _gameService.CreateSessionAsync(userId, request.GameType);
        
        if (!result.IsSuccess)
        {
            Logger.LogWarning("Failed to create game session: {Error}", result.Error);
            return HandleResult(result);
        }
        
        Logger.LogInformation("Game session created: {SessionId}", result.Data!.Id);
        return CreatedAtAction(nameof(GetSession), new { id = result.Data!.Id }, result.Data);
    }
    
    /// <summary>
    /// Get a game session by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(GameSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GameSessionDto>> GetSession(Guid id)
    {
        Logger.LogDebug("Getting game session: {SessionId}", id);
        
        var result = await _gameService.GetSessionAsync(id);
        
        if (!result.IsSuccess)
        {
            Logger.LogWarning("Game session not found: {SessionId}", id);
            return NotFound(new ApiErrorResponse(
                result.ErrorCode ?? "NOT_FOUND",
                result.Error ?? "Game session not found",
                HttpContext.TraceIdentifier
            ));
        }
        
        return Ok(result.Data);
    }
    
    /// <summary>
    /// Join an existing game session.
    /// </summary>
    [HttpPost("{id:guid}/join")]
    [ProducesResponseType(typeof(GameSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GameSessionDto>> JoinSession(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new ApiErrorResponse("INVALID_USER", "Invalid user identity", HttpContext.TraceIdentifier));
        }

        Logger.LogInformation("User {UserId} joining session {SessionId}", userId, id);
        
        var result = await _gameService.JoinSessionAsync(id, userId);
        
        if (!result.IsSuccess)
        {
            Logger.LogWarning("Failed to join session {SessionId}: {Error}", id, result.Error);
            return HandleResult(result);
        }
        
        Logger.LogInformation("User {UserId} joined session {SessionId}", userId, id);
        return Ok(result.Data);
    }
    
    /// <summary>
    /// Get current user's active game sessions.
    /// </summary>
    [HttpGet("my-sessions")]
    [ProducesResponseType(typeof(IEnumerable<GameSessionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<GameSessionDto>>> GetMySessions()
    {
        var userId = GetUserId();
        Logger.LogDebug("Getting sessions for user {UserId}", userId);
        
        var result = await _gameService.GetUserSessionsAsync(userId);
        
        return Ok(result.Data);
    }
    
    /// <summary>
    /// Complete a game with optional winner.
    /// </summary>
    [HttpPost("{id:guid}/complete")]
    [ProducesResponseType(typeof(GameSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GameSessionDto>> CompleteGame(Guid id, [FromBody] Guid? winnerId)
    {
        Logger.LogInformation("Completing game session {SessionId}, Winner: {WinnerId}", id, winnerId);
        
        var result = await _gameService.CompleteGameAsync(id, winnerId);
        
        if (!result.IsSuccess)
        {
            Logger.LogWarning("Failed to complete game {SessionId}: {Error}", id, result.Error);
            return HandleResult(result);
        }
        
        Logger.LogInformation("Game session completed: {SessionId}", id);
        return Ok(result.Data);
    }
}
