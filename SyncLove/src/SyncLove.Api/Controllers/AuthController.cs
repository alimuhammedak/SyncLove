using Microsoft.AspNetCore.Mvc;
using SyncLove.Api.Controllers.Base;
using SyncLove.Application.DTOs.Auth;
using SyncLove.Application.Interfaces;

namespace SyncLove.Api.Controllers;

/// <summary>
/// Authentication controller for user registration, login, and token management.
/// </summary>
[Route("api/[controller]")]
public class AuthController : ApiControllerBase
{
    private readonly IAuthService _authService;
    
    public AuthController(IAuthService authService, ILogger<AuthController> logger) 
        : base(logger)
    {
        _authService = authService;
    }
    
    /// <summary>
    /// Register a new user.
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        Logger.LogInformation("Registration attempt for email: {Email}", request.Email);
        
        var result = await _authService.RegisterAsync(request);
        
        if (!result.IsSuccess)
        {
            Logger.LogWarning("Registration failed for {Email}: {Error}", request.Email, result.Error);
            return HandleResult(result);
        }
        
        Logger.LogInformation("User registered successfully: {Email}", request.Email);
        SetRefreshTokenCookie(result.Data!.RefreshToken);
        return Ok(result.Data);
    }
    
    /// <summary>
    /// Login with email and password.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        Logger.LogInformation("Login attempt for email: {Email}", request.Email);
        
        var result = await _authService.LoginAsync(request);
        
        if (!result.IsSuccess)
        {
            Logger.LogWarning("Login failed for {Email}: {Error}", request.Email, result.Error);
            return Unauthorized(new ApiErrorResponse(
                result.ErrorCode ?? "LOGIN_FAILED",
                result.Error ?? "Invalid credentials",
                HttpContext.TraceIdentifier
            ));
        }
        
        Logger.LogInformation("User logged in successfully: {Email}", request.Email);
        SetRefreshTokenCookie(result.Data!.RefreshToken);
        return Ok(result.Data);
    }
    
    /// <summary>
    /// Refresh access token using refresh token from cookie or body.
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest? request = null)
    {
        var refreshToken = request?.RefreshToken ?? Request.Cookies["refreshToken"];
        
        if (string.IsNullOrEmpty(refreshToken))
        {
            Logger.LogWarning("Token refresh attempted without refresh token");
            return Unauthorized(new ApiErrorResponse(
                "NO_TOKEN",
                "No refresh token provided",
                HttpContext.TraceIdentifier
            ));
        }
        
        var ipAddress = GetIpAddress();
        var result = await _authService.RefreshTokenAsync(refreshToken, ipAddress);
        
        if (!result.IsSuccess)
        {
            Logger.LogWarning("Token refresh failed: {Error}", result.Error);
            return Unauthorized(new ApiErrorResponse(
                result.ErrorCode ?? "REFRESH_FAILED",
                result.Error ?? "Token refresh failed",
                HttpContext.TraceIdentifier
            ));
        }
        
        Logger.LogDebug("Token refreshed successfully");
        SetRefreshTokenCookie(result.Data!.RefreshToken);
        return Ok(result.Data);
    }
    
    /// <summary>
    /// Revoke a refresh token (logout).
    /// </summary>
    [HttpPost("revoke")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RevokeToken([FromBody] RefreshTokenRequest? request = null)
    {
        var refreshToken = request?.RefreshToken ?? Request.Cookies["refreshToken"];
        
        if (string.IsNullOrEmpty(refreshToken))
        {
            return BadRequest(new ApiErrorResponse(
                "NO_TOKEN",
                "No refresh token provided",
                HttpContext.TraceIdentifier
            ));
        }
        
        var ipAddress = GetIpAddress();
        var result = await _authService.RevokeTokenAsync(refreshToken, ipAddress);
        
        if (!result.IsSuccess)
        {
            Logger.LogWarning("Token revocation failed: {Error}", result.Error);
            return BadRequest(new ApiErrorResponse(
                result.ErrorCode ?? "REVOKE_FAILED",
                result.Error ?? "Token revocation failed",
                HttpContext.TraceIdentifier
            ));
        }
        
        Logger.LogInformation("Token revoked successfully");
        Response.Cookies.Delete("refreshToken");
        return Ok(new { message = "Token revoked successfully", traceId = HttpContext.TraceIdentifier });
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
