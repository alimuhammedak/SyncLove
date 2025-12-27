/**
 * Client-side emotion library for the drawing game.
 * Mirrors the backend EmotionLibrary for display purposes.
 */

export type EmotionDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Legendary';

export interface EmotionOption {
    emotion: string;
    category: string;
    difficulty: EmotionDifficulty;
}

export const EMOTION_CATEGORIES = {
    basic: {
        name: 'Temel Duygular',
        difficulty: 'Easy' as EmotionDifficulty,
        color: '#34c759',
        emotions: [
            'Mutluluk', 'Üzüntü', 'Korku', 'Öfke', 'Şaşkınlık',
            'İğrenme', 'Merak', 'Heyecan', 'Sevinç', 'Endişe',
            'Rahatlama', 'Hayranlık', 'Utanç', 'Kıskançlık', 'Gurur',
        ],
    },
    complex: {
        name: 'Karmaşık Hisler',
        difficulty: 'Medium' as EmotionDifficulty,
        color: '#ff9500',
        emotions: [
            'Nostalji', 'Yalnızlık', 'Umut', 'Hayal Kırıklığı', 'Melankoli',
            'Minnet', 'Özlem', 'Hüzün', 'Tedirginlik', 'Coşku',
            'Pişmanlık', 'Keder', 'Huzur', 'Kaygı', 'Şefkat',
        ],
    },
    moments: {
        name: 'Anlar ve Durumlar',
        difficulty: 'Hard' as EmotionDifficulty,
        color: '#ff3b30',
        emotions: [
            'Vedalaşmak', 'İlk Aşk', 'Gece Yarısı Düşünceleri', 'Son Bakış',
            'İlk Karın Yağışı', 'Yağmurda Yürümek', 'Güneşin Batışı',
            'Çocukluk Anıları', 'Ev Özlemi', 'Bir Şeyi Kaybetmek',
            'Yeniden Başlamak', 'Yıldızlara Bakmak', 'Rüyadan Uyanmak',
            'Bir Şarkının Hatırlattıkları', 'Fotoğraflara Bakmak',
        ],
    },
    abstract: {
        name: 'Soyut Kavramlar',
        difficulty: 'Legendary' as EmotionDifficulty,
        color: '#af52de',
        emotions: [
            'Kaos', 'Denge', 'Sonsuzluk', 'Boşluk', 'Zaman',
            'İhanet', 'Sadakat', 'Özgürlük', 'Esaret', 'Hayat',
            'Ölüm', 'Ruh', 'Kader', 'Tesadüf', 'Sessizlik',
        ],
    },
};

export const DIFFICULTY_COLORS: Record<EmotionDifficulty, string> = {
    Easy: '#34c759',
    Medium: '#ff9500',
    Hard: '#ff3b30',
    Legendary: '#af52de',
};

export const DIFFICULTY_LABELS: Record<EmotionDifficulty, string> = {
    Easy: 'Kolay',
    Medium: 'Orta',
    Hard: 'Zor',
    Legendary: 'Efsanevi',
};

export const DIFFICULTY_POINTS: Record<EmotionDifficulty, number> = {
    Easy: 10,
    Medium: 25,
    Hard: 50,
    Legendary: 100,
};

/**
 * Reaction icons available during guessing
 */
export const REACTION_ICONS = [
    { id: 'heart', emoji: '❤️', label: 'Sevgi' },
    { id: 'broken-heart', emoji: '💔', label: 'Üzüntü' },
    { id: 'fire', emoji: '🔥', label: 'Ateş' },
    { id: 'storm', emoji: '⚡', label: 'Fırtına' },
    { id: 'wave', emoji: '🌊', label: 'Dalga' },
    { id: 'sparkle', emoji: '✨', label: 'Parıltı' },
    { id: 'thinking', emoji: '🤔', label: 'Düşünce' },
    { id: 'wow', emoji: '😮', label: 'Şaşkınlık' },
];
