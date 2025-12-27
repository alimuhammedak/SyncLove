using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SyncLove.Infrastructure.Services;

namespace SyncLove.Api.Controllers;

/// <summary>
/// Controller for Agora.io voice chat integration.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AgoraController : ControllerBase
{
    private readonly AgoraTokenService _agoraService;

    public AgoraController(AgoraTokenService agoraService)
    {
        _agoraService = agoraService;
    }

    /// <summary>
    /// Get Agora RTC token for joining a voice channel.
    /// </summary>
    /// <param name="channelName">The channel name (usually the session/room ID)</param>
    /// <returns>Token and App ID for Agora connection</returns>
    [HttpGet("token")]
    public IActionResult GetToken([FromQuery] string channelName)
    {
        if (string.IsNullOrWhiteSpace(channelName))
        {
            return BadRequest("Channel name is required");
        }

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var token = _agoraService.GenerateRtcToken(channelName, userId);
        var appId = _agoraService.GetAppId();

        return Ok(new
        {
            Token = token,
            AppId = appId,
            ChannelName = channelName,
            UserId = userId
        });
    }
}
