using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SyncLove.Api.Controllers.Base;
using SyncLove.Application.DTOs.Auth;
using SyncLove.Application.Interfaces;

namespace SyncLove.Api.Controllers;

/// <summary>
/// User profile and partner management controller.
/// </summary>
[Route("api/[controller]")]
[Authorize]
public class UsersController : ApiControllerBase
{
    private readonly IAuthService _authService;
    
    public UsersController(IAuthService authService, ILogger<UsersController> logger) 
        : base(logger)
    {
        _authService = authService;
    }
    
    /// <summary>
    /// Get current user profile.
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            Logger.LogWarning("GetCurrentUser failed: Invalid user ID from claims");
            return Unauthorized(new ApiErrorResponse(
                "INVALID_USER",
                "Invalid user identity",
                HttpContext.TraceIdentifier
            ));
        }
        
        Logger.LogDebug("Getting user profile for {UserId}", userId);
        
        var result = await _authService.GetCurrentUserAsync(userId);
        
        if (!result.IsSuccess)
        {
            Logger.LogWarning("User not found: {UserId}", userId);
            return NotFound(new ApiErrorResponse(
                result.ErrorCode ?? "NOT_FOUND",
                result.Error ?? "User not found",
                HttpContext.TraceIdentifier
            ));
        }
        
        return Ok(result.Data);
    }
}
