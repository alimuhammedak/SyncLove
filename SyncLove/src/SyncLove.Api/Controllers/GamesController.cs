using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SyncLove.Application.DTOs.Game;
using SyncLove.Application.Interfaces;

namespace SyncLove.Api.Controllers;

/// <summary>
/// Game session management controller.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GamesController : ControllerBase
{
    private readonly IGameService _gameService;
    
    public GamesController(IGameService gameService)
    {
        _gameService = gameService;
    }
    
    /// <summary>
    /// Create a new game session.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(GameSessionDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<GameSessionDto>> CreateSession([FromBody] CreateGameRequest request)
    {
        var userId = GetUserId();
        var result = await _gameService.CreateSessionAsync(userId, request.GameType);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error, code = result.ErrorCode });
        }
        
        return CreatedAtAction(nameof(GetSession), new { id = result.Data!.Id }, result.Data);
    }
    
    /// <summary>
    /// Get a game session by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(GameSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GameSessionDto>> GetSession(Guid id)
    {
        var result = await _gameService.GetSessionAsync(id);
        
        if (!result.IsSuccess)
        {
            return NotFound(new { error = result.Error, code = result.ErrorCode });
        }
        
        return Ok(result.Data);
    }
    
    /// <summary>
    /// Join an existing game session.
    /// </summary>
    [HttpPost("{id:guid}/join")]
    [ProducesResponseType(typeof(GameSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GameSessionDto>> JoinSession(Guid id)
    {
        var userId = GetUserId();
        var result = await _gameService.JoinSessionAsync(id, userId);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error, code = result.ErrorCode });
        }
        
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
        var result = await _gameService.GetUserSessionsAsync(userId);
        
        return Ok(result.Data);
    }
    
    /// <summary>
    /// Complete a game with optional winner.
    /// </summary>
    [HttpPost("{id:guid}/complete")]
    [ProducesResponseType(typeof(GameSessionDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<GameSessionDto>> CompleteGame(Guid id, [FromBody] Guid? winnerId)
    {
        var result = await _gameService.CompleteGameAsync(id, winnerId);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error, code = result.ErrorCode });
        }
        
        return Ok(result.Data);
    }
    
    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}
