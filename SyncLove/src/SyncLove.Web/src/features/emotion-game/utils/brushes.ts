/**
 * Emotion brush definitions for the Drawing Canvas.
 * Each brush has unique visual characteristics matching the emotion.
 */

export interface BrushConfig {
    id: string;
    name: string;
    nameTr: string;
    color: string;
    secondaryColor: string;
    lineWidth: number;
    lineWidthVariation: number;
    opacity: number;
    opacityVariation: number;
    lineCap: CanvasLineCap;
    lineJoin: CanvasLineJoin;
    blur: number;
    jitter: number;
    texture: 'smooth' | 'rough' | 'dotted' | 'flowing';
}

export const EMOTION_BRUSHES: Record<string, BrushConfig> = {
    default: {
        id: 'default',
        name: 'Default',
        nameTr: 'Standart',
        color: '#ffffff',
        secondaryColor: '#cccccc',
        lineWidth: 4,
        lineWidthVariation: 0,
        opacity: 1,
        opacityVariation: 0,
        lineCap: 'round',
        lineJoin: 'round',
        blur: 0,
        jitter: 0,
        texture: 'smooth',
    },
    anger: {
        id: 'anger',
        name: 'Anger',
        nameTr: 'Öfke',
        color: '#ff3b30',
        secondaryColor: '#ff6b4a',
        lineWidth: 6,
        lineWidthVariation: 3,
        opacity: 0.95,
        opacityVariation: 0.1,
        lineCap: 'square',
        lineJoin: 'miter',
        blur: 0,
        jitter: 4,
        texture: 'rough',
    },
    peace: {
        id: 'peace',
        name: 'Peace',
        nameTr: 'Huzur',
        color: '#64d2ff',
        secondaryColor: '#5ac8fa',
        lineWidth: 8,
        lineWidthVariation: 2,
        opacity: 0.6,
        opacityVariation: 0.2,
        lineCap: 'round',
        lineJoin: 'round',
        blur: 8,
        jitter: 0,
        texture: 'flowing',
    },
    energy: {
        id: 'energy',
        name: 'Energy',
        nameTr: 'Enerji',
        color: '#ffcc00',
        secondaryColor: '#ff9f0a',
        lineWidth: 5,
        lineWidthVariation: 4,
        opacity: 0.9,
        opacityVariation: 0.1,
        lineCap: 'round',
        lineJoin: 'round',
        blur: 2,
        jitter: 2,
        texture: 'dotted',
    },
    melancholy: {
        id: 'melancholy',
        name: 'Melancholy',
        nameTr: 'Melankoli',
        color: '#5856d6',
        secondaryColor: '#8e8cd8',
        lineWidth: 3,
        lineWidthVariation: 1,
        opacity: 0.5,
        opacityVariation: 0.3,
        lineCap: 'round',
        lineJoin: 'round',
        blur: 4,
        jitter: 1,
        texture: 'flowing',
    },
    love: {
        id: 'love',
        name: 'Love',
        nameTr: 'Aşk',
        color: '#ff2d55',
        secondaryColor: '#ff375f',
        lineWidth: 5,
        lineWidthVariation: 2,
        opacity: 0.85,
        opacityVariation: 0.1,
        lineCap: 'round',
        lineJoin: 'round',
        blur: 3,
        jitter: 0,
        texture: 'smooth',
    },
    fear: {
        id: 'fear',
        name: 'Fear',
        nameTr: 'Korku',
        color: '#1c1c1e',
        secondaryColor: '#3a3a3c',
        lineWidth: 2,
        lineWidthVariation: 3,
        opacity: 0.7,
        opacityVariation: 0.3,
        lineCap: 'round',
        lineJoin: 'round',
        blur: 1,
        jitter: 6,
        texture: 'rough',
    },
};

export const COLOR_PALETTE = [
    // Primary colors
    '#ff3b30', // Red
    '#ff9500', // Orange
    '#ffcc00', // Yellow
    '#34c759', // Green
    '#5ac8fa', // Light Blue
    '#007aff', // Blue
    '#5856d6', // Purple
    '#ff2d55', // Pink
    // Neutrals
    '#ffffff', // White
    '#8e8e93', // Gray
    '#1c1c1e', // Black
    '#2c2c2e', // Dark Gray
];

/**
 * Apply brush settings to canvas context
 */
export function applyBrushToContext(
    ctx: CanvasRenderingContext2D,
    brush: BrushConfig,
    pressure: number = 1
): void {
    const widthVariation = brush.lineWidthVariation * (Math.random() - 0.5) * 2;
    const lineWidth = Math.max(1, brush.lineWidth + widthVariation) * pressure;

    ctx.lineWidth = lineWidth;
    ctx.lineCap = brush.lineCap;
    ctx.lineJoin = brush.lineJoin;
    ctx.globalAlpha = Math.min(1, brush.opacity + brush.opacityVariation * (Math.random() - 0.5));

    if (brush.blur > 0) {
        ctx.filter = `blur(${brush.blur * 0.5}px)`;
    } else {
        ctx.filter = 'none';
    }
}

/**
 * Calculate jittered point for rough brushes
 */
export function getJitteredPoint(x: number, y: number, jitter: number): { x: number; y: number } {
    if (jitter === 0) return { x, y };
    return {
        x: x + (Math.random() - 0.5) * jitter * 2,
        y: y + (Math.random() - 0.5) * jitter * 2,
    };
}
