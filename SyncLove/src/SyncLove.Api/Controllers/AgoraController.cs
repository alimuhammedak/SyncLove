using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SyncLove.Api.Controllers.Base;
using SyncLove.Infrastructure.Services;

namespace SyncLove.Api.Controllers;

/// <summary>
/// Controller for Agora.io voice chat integration.
/// </summary>
[Route("api/[controller]")]
[Authorize]
public class AgoraController : ApiControllerBase
{
    private readonly AgoraTokenService _agoraService;

    public AgoraController(AgoraTokenService agoraService, ILogger<AgoraController> logger) 
        : base(logger)
    {
        _agoraService = agoraService;
    }

    /// <summary>
    /// Get Agora RTC token for joining a voice channel.
    /// </summary>
    /// <param name="channelName">The channel name (usually the session/room ID)</param>
    /// <returns>Token and App ID for Agora connection</returns>
    [HttpGet("token")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public IActionResult GetToken([FromQuery] string channelName)
    {
        if (string.IsNullOrWhiteSpace(channelName))
        {
            Logger.LogWarning("Agora token request failed: Missing channel name");
            return BadRequest(new ApiErrorResponse(
                "VALIDATION_ERROR",
                "Channel name is required",
                HttpContext.TraceIdentifier
            ));
        }

        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            Logger.LogWarning("Agora token request failed: Invalid user identity");
            return Unauthorized(new ApiErrorResponse(
                "INVALID_USER",
                "Invalid user identity",
                HttpContext.TraceIdentifier
            ));
        }

        try
        {
            Logger.LogInformation("Generating Agora token for user {UserId}, channel {ChannelName}", 
                userId, channelName);
            
            var token = _agoraService.GenerateRtcToken(channelName, userId.ToString());
            var appId = _agoraService.GetAppId();

            if (string.IsNullOrEmpty(appId))
            {
                Logger.LogError("Agora App ID is not configured");
                return StatusCode(500, new ApiErrorResponse(
                    "CONFIGURATION_ERROR",
                    "Voice chat service is not properly configured",
                    HttpContext.TraceIdentifier
                ));
            }

            Logger.LogDebug("Agora token generated successfully for channel {ChannelName}", channelName);
            
            return Ok(new
            {
                token,
                appId,
                channelName,
                userId = userId.ToString()
            });
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Failed to generate Agora token for channel {ChannelName}", channelName);
            return StatusCode(500, new ApiErrorResponse(
                "TOKEN_GENERATION_FAILED",
                "Failed to generate voice chat token",
                HttpContext.TraceIdentifier
            ));
        }
    }
}
