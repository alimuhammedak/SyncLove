namespace SyncLove.Application.Services;

/// <summary>
/// Calculates emotional resonance scores for guess matching.
/// Uses Turkish synonyms for emotion words.
/// </summary>
public static class ResonanceScorer
{
    /// <summary>
    /// Synonym groups for Turkish emotion words.
    /// Words in the same group are considered similar.
    /// </summary>
    private static readonly List<HashSet<string>> SynonymGroups =
    [
        // Happiness family
        new(StringComparer.OrdinalIgnoreCase) { "Mutluluk", "Sevinç", "Neşe", "Keyif", "Coşku", "Huzur" },
        
        // Sadness family
        new(StringComparer.OrdinalIgnoreCase) { "Üzüntü", "Hüzün", "Keder", "Melankoli", "Acı", "Gam" },
        
        // Fear family
        new(StringComparer.OrdinalIgnoreCase) { "Korku", "Endişe", "Kaygı", "Tedirginlik", "Panik", "Telaş" },
        
        // Anger family
        new(StringComparer.OrdinalIgnoreCase) { "Öfke", "Kızgınlık", "Sinir", "Hiddet", "Gazap" },
        
        // Longing family
        new(StringComparer.OrdinalIgnoreCase) { "Özlem", "Hasret", "Nostalji", "Ev Özlemi", "Çocukluk Anıları" },
        
        // Love family
        new(StringComparer.OrdinalIgnoreCase) { "Aşk", "Sevgi", "İlk Aşk", "Tutku", "Şefkat" },
        
        // Loneliness family
        new(StringComparer.OrdinalIgnoreCase) { "Yalnızlık", "Issızlık", "Yabancılık", "Terk Edilmişlik" },
        
        // Hope family
        new(StringComparer.OrdinalIgnoreCase) { "Umut", "Beklenti", "Hayal", "İnanç" },
        
        // Chaos family
        new(StringComparer.OrdinalIgnoreCase) { "Kaos", "Kargaşa", "Düzensizlik", "Karmaşa" },
        
        // Peace family
        new(StringComparer.OrdinalIgnoreCase) { "Huzur", "Sükunet", "Dinginlik", "Sakinlik", "Barış" },
        
        // Regret family
        new(StringComparer.OrdinalIgnoreCase) { "Pişmanlık", "Hayal Kırıklığı", "Vicdan Azabı", "Üzgünlük" },
        
        // Betrayal family
        new(StringComparer.OrdinalIgnoreCase) { "İhanet", "Aldatılmak", "Güven Kaybı", "Hayal Kırıklığı" },
    ];

    /// <summary>
    /// Calculate resonance score between a guess and the target emotion.
    /// Returns 100 for exact match, 50-80 for synonyms, 0 for no match.
    /// </summary>
    public static int CalculateScore(string targetEmotion, string guess)
    {
        var normalizedTarget = NormalizeText(targetEmotion);
        var normalizedGuess = NormalizeText(guess);
        
        // Exact match
        if (normalizedTarget.Equals(normalizedGuess, StringComparison.OrdinalIgnoreCase))
        {
            return 100;
        }
        
        // Check if guess contains target or vice versa
        if (normalizedTarget.Contains(normalizedGuess, StringComparison.OrdinalIgnoreCase) ||
            normalizedGuess.Contains(normalizedTarget, StringComparison.OrdinalIgnoreCase))
        {
            return 75;
        }
        
        // Check synonym groups
        foreach (var group in SynonymGroups)
        {
            bool targetInGroup = group.Any(s => 
                NormalizeText(s).Equals(normalizedTarget, StringComparison.OrdinalIgnoreCase));
            bool guessInGroup = group.Any(s => 
                NormalizeText(s).Equals(normalizedGuess, StringComparison.OrdinalIgnoreCase));
            
            if (targetInGroup && guessInGroup)
            {
                return 60; // Synonym match
            }
        }
        
        // Calculate simple character similarity
        int similarity = CalculateLevenshteinSimilarity(normalizedTarget, normalizedGuess);
        if (similarity >= 70)
        {
            return 40; // Partial match based on similarity
        }
        
        return 0; // No match
    }

    /// <summary>
    /// Check if the guess is an exact match.
    /// </summary>
    public static bool IsExactMatch(string targetEmotion, string guess)
    {
        return CalculateScore(targetEmotion, guess) == 100;
    }

    private static string NormalizeText(string text)
    {
        return text.Trim().ToLowerInvariant();
    }

    private static int CalculateLevenshteinSimilarity(string s1, string s2)
    {
        int maxLen = Math.Max(s1.Length, s2.Length);
        if (maxLen == 0) return 100;
        
        int distance = LevenshteinDistance(s1, s2);
        return (int)((1.0 - (double)distance / maxLen) * 100);
    }

    private static int LevenshteinDistance(string s1, string s2)
    {
        int[,] d = new int[s1.Length + 1, s2.Length + 1];
        
        for (int i = 0; i <= s1.Length; i++) d[i, 0] = i;
        for (int j = 0; j <= s2.Length; j++) d[0, j] = j;
        
        for (int i = 1; i <= s1.Length; i++)
        {
            for (int j = 1; j <= s2.Length; j++)
            {
                int cost = s1[i - 1] == s2[j - 1] ? 0 : 1;
                d[i, j] = Math.Min(
                    Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                    d[i - 1, j - 1] + cost
                );
            }
        }
        
        return d[s1.Length, s2.Length];
    }
}
