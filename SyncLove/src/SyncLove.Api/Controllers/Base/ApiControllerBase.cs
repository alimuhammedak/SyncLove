using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using SyncLove.Application.Common;

namespace SyncLove.Api.Controllers.Base;

/// <summary>
/// Base controller providing common functionality for all API controllers.
/// </summary>
[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected readonly ILogger Logger;

    protected ApiControllerBase(ILogger logger)
    {
        Logger = logger;
    }

    /// <summary>
    /// Gets the current user's ID from JWT claims.
    /// </summary>
    protected Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }

        Logger.LogWarning("Failed to parse user ID from claims: {ClaimValue}", userIdClaim);
        return Guid.Empty;
    }

    /// <summary>
    /// Gets the current user's email from JWT claims.
    /// </summary>
    protected string? GetUserEmail()
    {
        return User.FindFirst(ClaimTypes.Email)?.Value;
    }

    /// <summary>
    /// Handles a Result<T> and returns appropriate ActionResult.
    /// </summary>
    protected ActionResult<T> HandleResult<T>(Result<T> result, int successStatusCode = 200)
    {
        if (!result.IsSuccess)
        {
            Logger.LogWarning("Operation failed: {Error} (Code: {ErrorCode})", 
                result.Error, result.ErrorCode);

            var errorResponse = new ApiErrorResponse(
                result.ErrorCode ?? "OPERATION_FAILED",
                result.Error ?? "An error occurred",
                HttpContext.TraceIdentifier
            );

            return result.ErrorCode switch
            {
                "NOT_FOUND" => NotFound(errorResponse),
                "UNAUTHORIZED" => Unauthorized(errorResponse),
                "FORBIDDEN" => StatusCode(403, errorResponse),
                "VALIDATION_ERROR" => BadRequest(errorResponse),
                _ => BadRequest(errorResponse)
            };
        }

        return successStatusCode switch
        {
            201 => StatusCode(201, result.Data),
            204 => (NoContent() as ActionResult<T>)!,
            _ => Ok(result.Data)
        };
    }

    /// <summary>
    /// Handles a Result (without data) and returns appropriate ActionResult.
    /// </summary>
    protected IActionResult HandleResult(Result result, string? successMessage = null)
    {
        if (!result.IsSuccess)
        {
            Logger.LogWarning("Operation failed: {Error} (Code: {ErrorCode})", 
                result.Error, result.ErrorCode);

            var errorResponse = new ApiErrorResponse(
                result.ErrorCode ?? "OPERATION_FAILED",
                result.Error ?? "An error occurred",
                HttpContext.TraceIdentifier
            );

            return result.ErrorCode switch
            {
                "NOT_FOUND" => NotFound(errorResponse),
                "UNAUTHORIZED" => Unauthorized(errorResponse),
                "FORBIDDEN" => StatusCode(403, errorResponse),
                _ => BadRequest(errorResponse)
            };
        }

        return successMessage != null 
            ? Ok(new { message = successMessage, traceId = HttpContext.TraceIdentifier }) 
            : NoContent();
    }
}

/// <summary>
/// Standardized API error response.
/// </summary>
public record ApiErrorResponse(
    string Code,
    string Message,
    string TraceId,
    object? Details = null
);
