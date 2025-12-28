using System.Diagnostics;

namespace SyncLove.Api.Middleware;

/// <summary>
/// Middleware for logging HTTP requests and responses with timing information.
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var requestId = context.TraceIdentifier;
        var userId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "anonymous";

        _logger.LogInformation(
            "HTTP {Method} {Path} started - RequestId: {RequestId}, User: {UserId}",
            context.Request.Method,
            context.Request.Path,
            requestId,
            userId);

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            
            var logLevel = context.Response.StatusCode >= 500 
                ? LogLevel.Error 
                : context.Response.StatusCode >= 400 
                    ? LogLevel.Warning 
                    : LogLevel.Information;

            _logger.Log(logLevel,
                "HTTP {Method} {Path} completed - Status: {StatusCode}, Duration: {Duration}ms, RequestId: {RequestId}, User: {UserId}",
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                stopwatch.ElapsedMilliseconds,
                requestId,
                userId);
        }
    }
}

/// <summary>
/// Extension methods for registering the RequestLoggingMiddleware.
/// </summary>
public static class RequestLoggingMiddlewareExtensions
{
    public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder app)
    {
        return app.UseMiddleware<RequestLoggingMiddleware>();
    }
}
