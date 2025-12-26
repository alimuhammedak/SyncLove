# 04 - SignalR Realtime

## Purpose
Standards for in-game synchronization (position, actions) and lobby management.

## Backend: Hub Design
Hubs should be kept "thin", logic should be delegated to services.

### GameHub Example (C#)
```csharp
[Authorize]
public class GameHub : Hub<IGameClient>
{
    private readonly IGameEngine _engine;

    public async Task JoinGame(string gameId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
        await Clients.Group(gameId).PlayerJoined(Context.UserIdentifier);
    }

    public async Task SendMove(string gameId, MoveDto move)
    {
        // Validation is done in the service
        if(await _engine.ValidateMove(move))
        {
            await Clients.Group(gameId).ReceiveMove(move);
        }
    }
}

public interface IGameClient
{
    Task PlayerJoined(string userId);
    Task ReceiveMove(MoveDto move);
}
```

## Frontend: Connection Management

On the React side, the connection should be managed through a single hook. Automatic Reconnect is mandatory.

### useSignalR Hook Example

```typescript
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export const useGameConnection = (url: string) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(url, {
         accessTokenFactory: () => localStorage.getItem("token") || ""
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000]) // Retry delays
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(newConnection);
  }, [url]);

  return connection;
};
```

## Best Practices

1. **Group Usage:** Each game session (`SessionId`) is a SignalR group. Use `Group` messaging instead of `Broadcast`.
2. **Payload Size:** Minimize the sent JSON data. Do not send unnecessary fields.
3. **Serverless:** If using Azure SignalR Service, consider "Serverless" mode.
