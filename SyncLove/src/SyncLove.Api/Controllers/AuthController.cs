using Microsoft.AspNetCore.Mvc;
using SyncLove.Application.DTOs.Auth;
using SyncLove.Application.Interfaces;

namespace SyncLove.Api.Controllers;

/// <summary>
/// Authentication controller for user registration, login, and token management.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }
    
    /// <summary>
    /// Register a new user.
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error, code = result.ErrorCode });
        }
        
        SetRefreshTokenCookie(result.Data!.RefreshToken);
        return Ok(result.Data);
    }
    
    /// <summary>
    /// Login with email and password.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        
        if (!result.IsSuccess)
        {
            return Unauthorized(new { error = result.Error, code = result.ErrorCode });
        }
        
        SetRefreshTokenCookie(result.Data!.RefreshToken);
        return Ok(result.Data);
    }
    
    /// <summary>
    /// Refresh access token using refresh token from cookie or body.
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest? request = null)
    {
        var refreshToken = request?.RefreshToken ?? Request.Cookies["refreshToken"];
        
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new { error = "No refresh token provided.", code = "NO_TOKEN" });
        }
        
        var ipAddress = GetIpAddress();
        var result = await _authService.RefreshTokenAsync(refreshToken, ipAddress);
        
        if (!result.IsSuccess)
        {
            return Unauthorized(new { error = result.Error, code = result.ErrorCode });
        }
        
        SetRefreshTokenCookie(result.Data!.RefreshToken);
        return Ok(result.Data);
    }
    
    /// <summary>
    /// Revoke a refresh token (logout).
    /// </summary>
    [HttpPost("revoke")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RevokeToken([FromBody] RefreshTokenRequest? request = null)
    {
        var refreshToken = request?.RefreshToken ?? Request.Cookies["refreshToken"];
        
        if (string.IsNullOrEmpty(refreshToken))
        {
            return BadRequest(new { error = "No refresh token provided.", code = "NO_TOKEN" });
        }
        
        var ipAddress = GetIpAddress();
        var result = await _authService.RevokeTokenAsync(refreshToken, ipAddress);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error, code = result.ErrorCode });
        }
        
        // Clear cookie
        Response.Cookies.Delete("refreshToken");
        return Ok(new { message = "Token revoked successfully." });
    }
    
    private void SetRefreshTokenCookie(string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(7)
        };
        Response.Cookies.Append("refreshToken", token, cookieOptions);
    }
    
    private string? GetIpAddress()
    {
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
        {
            return Request.Headers["X-Forwarded-For"].FirstOrDefault();
        }
        
        return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString();
    }
}
