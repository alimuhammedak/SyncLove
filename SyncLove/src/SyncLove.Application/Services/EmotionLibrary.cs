using SyncLove.Domain.Enums;

namespace SyncLove.Application.Services;

/// <summary>
/// Static library of emotions categorized by difficulty.
/// </summary>
public static class EmotionLibrary
{
    /// <summary>
    /// All available emotions organized by category.
    /// </summary>
    public static readonly Dictionary<string, EmotionCategory> Categories = new()
    {
        ["TemelDuygular"] = new EmotionCategory
        {
            Name = "Temel Duygular",
            Difficulty = EmotionDifficulty.Easy,
            Emotions = [
                "Mutluluk", "Üzüntü", "Korku", "Öfke", "Şaşkınlık",
                "İğrenme", "Merak", "Heyecan", "Sevinç", "Endişe",
                "Rahatlama", "Hayranlık", "Utanç", "Kıskançlık", "Gurur"
            ]
        },
        ["KarmasikHisler"] = new EmotionCategory
        {
            Name = "Karmaşık Hisler",
            Difficulty = EmotionDifficulty.Medium,
            Emotions = [
                "Nostalji", "Yalnızlık", "Umut", "Hayal Kırıklığı", "Melankoli",
                "Minnet", "Özlem", "Hüzün", "Tedirginlik", "Coşku",
                "Pişmanlık", "Keder", "Huzur", "Kaygı", "Şefkat"
            ]
        },
        ["AnlarVeDurumlar"] = new EmotionCategory
        {
            Name = "Anlar ve Durumlar",
            Difficulty = EmotionDifficulty.Hard,
            Emotions = [
                "Vedalaşmak", "İlk Aşk", "Gece Yarısı Düşünceleri", "Son Bakış",
                "İlk Karın Yağışı", "Yağmurda Yürümek", "Güneşin Batışı",
                "Çocukluk Anıları", "Ev Özlemi", "Bir Şeyi Kaybetmek",
                "Yeniden Başlamak", "Yıldızlara Bakmak", "Rüyadan Uyanmak",
                "Bir Şarkının Hatırlattıkları", "Fotoğraflara Bakmak"
            ]
        },
        ["SoyutKavramlar"] = new EmotionCategory
        {
            Name = "Soyut Kavramlar",
            Difficulty = EmotionDifficulty.Legendary,
            Emotions = [
                "Kaos", "Denge", "Sonsuzluk", "Boşluk", "Zaman",
                "İhanet", "Sadakat", "Özgürlük", "Esaret", "Hayat",
                "Ölüm", "Ruh", "Kader", "Tesadüf", "Sessizlik"
            ]
        }
    };

    /// <summary>
    /// Get random emotions for player selection (3 options, one from each lower difficulty).
    /// </summary>
    public static List<EmotionOption> GetRandomOptions(Random? random = null)
    {
        random ??= new Random();
        var options = new List<EmotionOption>();
        
        // Easy option
        var easy = Categories["TemelDuygular"];
        options.Add(new EmotionOption
        {
            Emotion = easy.Emotions[random.Next(easy.Emotions.Count)],
            Category = easy.Name,
            Difficulty = easy.Difficulty
        });
        
        // Medium option
        var medium = Categories["KarmasikHisler"];
        options.Add(new EmotionOption
        {
            Emotion = medium.Emotions[random.Next(medium.Emotions.Count)],
            Category = medium.Name,
            Difficulty = medium.Difficulty
        });
        
        // Hard option (randomly hard or legendary)
        var hard = random.Next(2) == 0 ? Categories["AnlarVeDurumlar"] : Categories["SoyutKavramlar"];
        options.Add(new EmotionOption
        {
            Emotion = hard.Emotions[random.Next(hard.Emotions.Count)],
            Category = hard.Name,
            Difficulty = hard.Difficulty
        });
        
        return options;
    }

    /// <summary>
    /// Get a specific emotion by name.
    /// </summary>
    public static EmotionOption? FindEmotion(string emotionName)
    {
        foreach (var category in Categories.Values)
        {
            if (category.Emotions.Contains(emotionName))
            {
                return new EmotionOption
                {
                    Emotion = emotionName,
                    Category = category.Name,
                    Difficulty = category.Difficulty
                };
            }
        }
        return null;
    }
}

/// <summary>
/// Category of emotions with shared difficulty.
/// </summary>
public class EmotionCategory
{
    public required string Name { get; set; }
    public EmotionDifficulty Difficulty { get; set; }
    public List<string> Emotions { get; set; } = [];
}

/// <summary>
/// Single emotion option for player selection.
/// </summary>
public class EmotionOption
{
    public required string Emotion { get; set; }
    public required string Category { get; set; }
    public EmotionDifficulty Difficulty { get; set; }
}
