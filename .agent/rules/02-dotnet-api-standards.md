# 02 - .NET API Standards

## Purpose
Standards to be followed when developing .NET Web API, code quality, and API contract rules.

## Controller & Endpoint Standards
- **Resource Naming:** Use plural names (`/users`, `/games`).
- **Versioning:** URL-based versioning (`/api/v1/...`).
- **Action Results:** Always return `ActionResult<T>`.

### Example Controller Structure
```csharp
[ApiController]
[Route("api/v1/[controller]")]
public class GamesController : ControllerBase
{
    private readonly IGameService _gameService;

    public GamesController(IGameService gameService) => _gameService = gameService;

    // GET api/v1/games/{id}
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(GameDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GameDto>> GetGameById(Guid id)
    {
        var game = await _gameService.GetAsync(id);
        if (game == null) return NotFound(ProblemDetailsFactory.Create("Game not found"));
        return Ok(game);
    }
}
```

## Validation & Error Handling

* **FluentValidation:** Validate request DTOs before entering the controller.
* **ProblemDetails (RFC 7807):** Return errors in a standard format.

### Global Exception Handler Example

```csharp
public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
{
    var problemDetails = new ProblemDetails
    {
        Status = StatusCodes.Status500InternalServerError,
        Title = "An error occurred",
        Detail = exception.Message // Log in prod, return generic message to user
    };
    await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
    return true;
}
```

## OpenAPI / Swagger Integration

* `<summary>` and `<response>` documentation is mandatory for each endpoint.
* Show enums as strings (`JsonStringEnumConverter`).

### Swagger Configuration (Program.cs snippet)

```csharp
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SuperApp API", Version = "v1" });
    // JWT Auth Definition
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme { ... });
});
```

## Database & Entity Framework

* **No Tracking:** Use `.AsNoTracking()` in read operations.
* **Migrations:** Migration scripts must be idempotent before each deployment.
* **Repository Pattern:** Use only for complex queries; Service -> DBContext is sufficient for simple CRUD.
