using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SyncLove.Application.DTOs.Game;
using SyncLove.Application.Interfaces;

namespace SyncLove.Api.Hubs;

/// <summary>
/// SignalR hub for real-time game synchronization.
/// </summary>
[Authorize]
public class GameHub : Hub
{
    private readonly IGameService _gameService;
    
    public GameHub(IGameService gameService)
    {
        _gameService = gameService;
    }
    
    /// <summary>
    /// Join a game session room.
    /// </summary>
    public async Task JoinGame(string sessionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
        
        var userId = GetUserId();
        await Clients.Group(sessionId).SendAsync("PlayerJoined", new
        {
            SessionId = sessionId,
            PlayerId = userId,
            JoinedAt = DateTime.UtcNow
        });
    }
    
    /// <summary>
    /// Leave a game session room.
    /// </summary>
    public async Task LeaveGame(string sessionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);
        
        var userId = GetUserId();
        await Clients.Group(sessionId).SendAsync("PlayerLeft", new
        {
            SessionId = sessionId,
            PlayerId = userId,
            LeftAt = DateTime.UtcNow
        });
    }
    
    /// <summary>
    /// Send game state update to all players in session.
    /// </summary>
    public async Task SendGameState(string sessionId, object gameState)
    {
        var userId = GetUserId();
        await Clients.OthersInGroup(sessionId).SendAsync("ReceiveGameState", new GameStateUpdate(
            Guid.Parse(sessionId),
            System.Text.Json.JsonSerializer.Serialize(gameState),
            userId
        ));
    }
    
    /// <summary>
    /// Send drawing data to partner in real-time.
    /// </summary>
    public async Task SendDrawing(string sessionId, DrawingPoint[] points)
    {
        var userId = GetUserId();
        await Clients.OthersInGroup(sessionId).SendAsync("ReceiveDrawing", new
        {
            SessionId = sessionId,
            SenderId = userId,
            Points = points,
            Timestamp = DateTime.UtcNow
        });
    }
    
    /// <summary>
    /// Send cursor position for collaborative features.
    /// </summary>
    public async Task SendCursor(string sessionId, float x, float y)
    {
        var userId = GetUserId();
        await Clients.OthersInGroup(sessionId).SendAsync("ReceiveCursor", new
        {
            PlayerId = userId,
            X = x,
            Y = y
        });
    }
    
    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        await Clients.All.SendAsync("UserConnected", userId);
        await base.OnConnectedAsync();
    }
    
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();
        await Clients.All.SendAsync("UserDisconnected", userId);
        await base.OnDisconnectedAsync(exception);
    }
    
    private Guid GetUserId()
    {
        var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}
