using SyncLove.Domain.Enums;

namespace SyncLove.Application.DTOs.EmotionGame;

/// <summary>
/// Emotion option sent to player for selection.
/// </summary>
public record EmotionOptionDto(
    string Emotion,
    string Category,
    EmotionDifficulty Difficulty
);

/// <summary>
/// Guess submission from a player.
/// </summary>
public record GuessSubmissionDto(
    string SessionId,
    string GuessText
);

/// <summary>
/// Result of a guess.
/// </summary>
public record GuessResultDto(
    string PlayerId,
    string GuessText,
    bool IsExactMatch,
    int ResonanceScore,
    DateTime GuessedAt
);

/// <summary>
/// Reaction from a player (emotion icon).
/// </summary>
public record ReactionDto(
    string SessionId,
    string ReactionType // heart, broken-heart, fire, storm, wave, sparkle
);

/// <summary>
/// Current round state.
/// </summary>
public record EmotionRoundDto(
    Guid RoundId,
    string? Emotion, // null for guessing players
    string Category,
    EmotionDifficulty Difficulty,
    Guid DrawerId,
    int TimeLimit,
    int TimeRemaining,
    List<GuessResultDto> Guesses,
    bool IsComplete,
    Guid? WinnerId
);

/// <summary>
/// Player score in the game.
/// </summary>
public record PlayerScoreDto(
    Guid PlayerId,
    string DisplayName,
    int TotalScore,
    int CorrectGuesses,
    int ResonancePoints
);

/// <summary>
/// Emotion game session state.
/// </summary>
public record EmotionGameStateDto(
    Guid SessionId,
    List<Guid> Players,
    EmotionRoundDto? CurrentRound,
    List<PlayerScoreDto> Scores,
    int RoundNumber,
    int TotalRounds
);

/// <summary>
/// Drawing stroke data.
/// </summary>
public record DrawingStrokeDto(
    List<PointDto> Points,
    string BrushType, // anger, peace, energy, melancholy, default
    string Color,
    int Size
);

/// <summary>
/// Single point in a drawing.
/// </summary>
public record PointDto(
    float X,
    float Y,
    float Pressure
);
