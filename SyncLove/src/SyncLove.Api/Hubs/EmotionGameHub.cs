using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SyncLove.Application.DTOs.EmotionGame;
using SyncLove.Application.Services;

namespace SyncLove.Api.Hubs;

/// <summary>
/// SignalR hub for the Emotion Drawing game (Duygu İzleri).
/// </summary>
[Authorize]
public class EmotionGameHub : Hub
{
    private static readonly Dictionary<string, EmotionGameState> GameStates = new();
    private static readonly object StateLock = new();

    /// <summary>
    /// Join an emotion game session.
    /// </summary>
    public async Task JoinEmotionGame(string sessionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
        var userId = GetUserId();

        lock (StateLock)
        {
            if (!GameStates.TryGetValue(sessionId, out var state))
            {
                state = new EmotionGameState { SessionId = sessionId };
                GameStates[sessionId] = state;
            }

            if (!state.Players.Contains(userId))
            {
                state.Players.Add(userId);
            }
        }

        await Clients.Group(sessionId).SendAsync("PlayerJoinedEmotion", new
        {
            SessionId = sessionId,
            PlayerId = userId,
            JoinedAt = DateTime.UtcNow
        });

        // Send current state to joining player
        if (GameStates.TryGetValue(sessionId, out var currentState))
        {
            await Clients.Caller.SendAsync("EmotionGameState", currentState.ToDto());
        }
    }

    /// <summary>
    /// Leave the emotion game session.
    /// </summary>
    public async Task LeaveEmotionGame(string sessionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);
        var userId = GetUserId();

        lock (StateLock)
        {
            if (GameStates.TryGetValue(sessionId, out var state))
            {
                state.Players.Remove(userId);
                if (state.Players.Count == 0)
                {
                    GameStates.Remove(sessionId);
                }
            }
        }

        await Clients.Group(sessionId).SendAsync("PlayerLeftEmotion", new
        {
            SessionId = sessionId,
            PlayerId = userId,
            LeftAt = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get emotion options for the drawer to select.
    /// </summary>
    public async Task GetEmotionOptions(string sessionId)
    {
        var options = EmotionLibrary.GetRandomOptions();
        var optionDtos = options.Select(o => new EmotionOptionDto(o.Emotion, o.Category, o.Difficulty)).ToList();
        
        await Clients.Caller.SendAsync("EmotionOptions", optionDtos);
    }

    /// <summary>
    /// Start a new round with the selected emotion.
    /// </summary>
    public async Task StartRound(string sessionId, string emotion)
    {
        var userId = GetUserId();
        var emotionInfo = EmotionLibrary.FindEmotion(emotion);
        
        if (emotionInfo == null)
        {
            await Clients.Caller.SendAsync("Error", "Invalid emotion selected");
            return;
        }

        lock (StateLock)
        {
            if (GameStates.TryGetValue(sessionId, out var state))
            {
                state.CurrentRound = new RoundState
                {
                    RoundId = Guid.NewGuid(),
                    Emotion = emotion,
                    Category = emotionInfo.Category,
                    Difficulty = emotionInfo.Difficulty,
                    DrawerId = userId,
                    StartedAt = DateTime.UtcNow,
                    TimeLimit = 60
                };
                state.RoundNumber++;
            }
        }

        // Notify all players round started (drawer sees emotion, others don't)
        await Clients.Group(sessionId).SendAsync("RoundStarted", new
        {
            SessionId = sessionId,
            RoundId = GameStates[sessionId].CurrentRound!.RoundId,
            DrawerId = userId,
            Category = emotionInfo.Category,
            Difficulty = emotionInfo.Difficulty,
            TimeLimit = 60
        });

        // Only send emotion to drawer
        await Clients.Caller.SendAsync("YourEmotionToDraw", emotion);
    }

    /// <summary>
    /// Broadcast drawing strokes to other players.
    /// </summary>
    public async Task SendDrawingStroke(string sessionId, DrawingStrokeDto stroke)
    {
        var userId = GetUserId();
        
        await Clients.OthersInGroup(sessionId).SendAsync("ReceiveDrawingStroke", new
        {
            SessionId = sessionId,
            SenderId = userId,
            Stroke = stroke,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Submit a guess for the current emotion.
    /// </summary>
    public async Task SubmitGuess(string sessionId, string guessText)
    {
        var userId = GetUserId();
        GuessResultDto? result = null;

        lock (StateLock)
        {
            if (!GameStates.TryGetValue(sessionId, out var state) || state.CurrentRound == null)
            {
                return;
            }

            if (state.CurrentRound.DrawerId == userId)
            {
                return; // Drawer can't guess
            }

            var resonanceScore = ResonanceScorer.CalculateScore(state.CurrentRound.Emotion, guessText);
            var isExact = ResonanceScorer.IsExactMatch(state.CurrentRound.Emotion, guessText);

            result = new GuessResultDto(
                userId.ToString(),
                guessText,
                isExact,
                resonanceScore,
                DateTime.UtcNow
            );

            state.CurrentRound.Guesses.Add(result);

            // Update scores
            if (!state.Scores.ContainsKey(userId))
            {
                state.Scores[userId] = new PlayerScore { PlayerId = userId };
            }

            state.Scores[userId].ResonancePoints += resonanceScore;
            
            if (isExact)
            {
                state.Scores[userId].CorrectGuesses++;
                state.Scores[userId].TotalScore += 100 + resonanceScore;
                state.CurrentRound.IsComplete = true;
                state.CurrentRound.WinnerId = userId;
            }
            else if (resonanceScore > 0)
            {
                state.Scores[userId].TotalScore += resonanceScore;
            }
        }

        // Broadcast guess result
        await Clients.Group(sessionId).SendAsync("GuessResult", result);

        // Check if round ended
        if (result?.IsExactMatch == true)
        {
            await EndRound(sessionId, true);
        }
    }

    /// <summary>
    /// Send a reaction (emotion icon) to the drawing.
    /// </summary>
    public async Task SendReaction(string sessionId, string reactionType)
    {
        var userId = GetUserId();
        
        await Clients.Group(sessionId).SendAsync("ReactionReceived", new
        {
            SessionId = sessionId,
            SenderId = userId,
            ReactionType = reactionType,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// End the current round (timer expired or correct guess).
    /// </summary>
    public async Task EndRound(string sessionId, bool wasGuessed)
    {
        string? emotion = null;
        Guid? winnerId = null;

        lock (StateLock)
        {
            if (GameStates.TryGetValue(sessionId, out var state) && state.CurrentRound != null)
            {
                emotion = state.CurrentRound.Emotion;
                winnerId = state.CurrentRound.WinnerId;
                state.CurrentRound.IsComplete = true;
                state.CurrentRound.EndedAt = DateTime.UtcNow;
            }
        }

        await Clients.Group(sessionId).SendAsync("RoundEnded", new
        {
            SessionId = sessionId,
            Emotion = emotion,
            WasGuessed = wasGuessed,
            WinnerId = winnerId,
            Scores = GetScores(sessionId)
        });
    }

    /// <summary>
    /// Clear the canvas (only drawer can do this).
    /// </summary>
    public async Task ClearCanvas(string sessionId)
    {
        var userId = GetUserId();

        lock (StateLock)
        {
            if (GameStates.TryGetValue(sessionId, out var state) && 
                state.CurrentRound?.DrawerId != userId)
            {
                return; // Only drawer can clear
            }
        }

        await Clients.Group(sessionId).SendAsync("CanvasCleared", new
        {
            SessionId = sessionId,
            ClearedBy = userId
        });
    }

    private List<PlayerScoreDto> GetScores(string sessionId)
    {
        lock (StateLock)
        {
            if (GameStates.TryGetValue(sessionId, out var state))
            {
                return state.Scores.Values.Select(s => new PlayerScoreDto(
                    s.PlayerId,
                    $"Player {s.PlayerId.ToString()[..8]}",
                    s.TotalScore,
                    s.CorrectGuesses,
                    s.ResonancePoints
                )).OrderByDescending(s => s.TotalScore).ToList();
            }
        }
        return [];
    }

    private Guid GetUserId()
    {
        var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}

// Internal state classes
internal class EmotionGameState
{
    public required string SessionId { get; set; }
    public List<Guid> Players { get; set; } = [];
    public Dictionary<Guid, PlayerScore> Scores { get; set; } = [];
    public RoundState? CurrentRound { get; set; }
    public int RoundNumber { get; set; }
    public int TotalRounds { get; set; } = 5;

    public EmotionGameStateDto ToDto() => new(
        Guid.TryParse(SessionId, out var id) ? id : Guid.Empty,
        Players,
        CurrentRound?.ToDto(),
        Scores.Values.Select(s => new PlayerScoreDto(
            s.PlayerId,
            $"Player {s.PlayerId.ToString()[..8]}",
            s.TotalScore,
            s.CorrectGuesses,
            s.ResonancePoints
        )).ToList(),
        RoundNumber,
        TotalRounds
    );
}

internal class RoundState
{
    public Guid RoundId { get; set; }
    public required string Emotion { get; set; }
    public required string Category { get; set; }
    public Domain.Enums.EmotionDifficulty Difficulty { get; set; }
    public Guid DrawerId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int TimeLimit { get; set; }
    public List<GuessResultDto> Guesses { get; set; } = [];
    public bool IsComplete { get; set; }
    public Guid? WinnerId { get; set; }

    public EmotionRoundDto ToDto() => new(
        RoundId,
        null, // Don't expose emotion to guessers
        Category,
        Difficulty,
        DrawerId,
        TimeLimit,
        (int)Math.Max(0, TimeLimit - (DateTime.UtcNow - StartedAt).TotalSeconds),
        Guesses,
        IsComplete,
        WinnerId
    );
}

internal class PlayerScore
{
    public Guid PlayerId { get; set; }
    public int TotalScore { get; set; }
    public int CorrectGuesses { get; set; }
    public int ResonancePoints { get; set; }
}
