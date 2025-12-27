/**
 * Drawing Canvas Component for Emotion Drawing Game
 * Supports emotion-based brushes, undo/redo, and real-time sync
 */

import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { EMOTION_BRUSHES, COLOR_PALETTE, applyBrushToContext, getJitteredPoint, type BrushConfig } from '../utils/brushes';
import { Undo2, Redo2, Trash2, Paintbrush } from 'lucide-react';

export interface DrawingPoint {
    x: number;
    y: number;
    pressure: number;
}

export interface DrawingStroke {
    points: DrawingPoint[];
    brushType: string;
    color: string;
    size: number;
}

export interface DrawingCanvasProps {
    width?: number;
    height?: number;
    isDrawer?: boolean;
    onStrokeComplete?: (stroke: DrawingStroke) => void;
    onClear?: () => void;
    className?: string;
}

export interface DrawingCanvasRef {
    clear: () => void;
    undo: () => void;
    redo: () => void;
    addStroke: (stroke: DrawingStroke) => void;
    getImageData: () => string;
}

// Helper function to draw a stroke on canvas (outside component for react-refresh)
function drawStrokeOnCanvas(ctx: CanvasRenderingContext2D, stroke: DrawingStroke): void {
    if (stroke.points.length < 2) return;

    const brush = EMOTION_BRUSHES[stroke.brushType] || EMOTION_BRUSHES.default;

    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = brush.lineCap;
    ctx.lineJoin = brush.lineJoin;
    ctx.globalAlpha = brush.opacity;

    if (brush.blur > 0) {
        ctx.filter = `blur(${brush.blur * 0.3}px)`;
    }

    ctx.beginPath();
    const firstPoint = getJitteredPoint(stroke.points[0].x, stroke.points[0].y, brush.jitter);
    ctx.moveTo(firstPoint.x, firstPoint.y);

    for (let i = 1; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        const { x, y } = getJitteredPoint(point.x, point.y, brush.jitter);

        // Smooth line using quadratic curves
        if (i < stroke.points.length - 1) {
            const nextPoint = stroke.points[i + 1];
            const midX = (x + nextPoint.x) / 2;
            const midY = (y + nextPoint.y) / 2;
            ctx.quadraticCurveTo(x, y, midX, midY);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();
    ctx.restore();
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({
    width = 800,
    height = 600,
    isDrawer = true,
    onStrokeComplete,
    onClear,
    className = '',
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [currentBrush, setCurrentBrush] = useState<BrushConfig>(EMOTION_BRUSHES.default);
    const [currentColor, setCurrentColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(4);
    const [showBrushPanel, setShowBrushPanel] = useState(false);

    const currentStrokeRef = useRef<DrawingPoint[]>([]);
    const strokeHistoryRef = useRef<DrawingStroke[]>([]);
    const redoStackRef = useRef<DrawingStroke[]>([]);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#1c1c1e';
        ctx.fillRect(0, 0, width, height);
        contextRef.current = ctx;
    }, [width, height]);

    // Redraw all strokes
    const redrawCanvas = useCallback(() => {
        const ctx = contextRef.current;
        if (!ctx) return;

        ctx.fillStyle = '#1c1c1e';
        ctx.fillRect(0, 0, width, height);

        strokeHistoryRef.current.forEach(stroke => {
            drawStrokeOnCanvas(ctx, stroke);
        });
    }, [width, height]);

    // Get coordinates from event
    const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number; pressure: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0, pressure: 1 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if ('touches' in e) {
            const touch = e.touches[0];
            return {
                x: (touch.clientX - rect.left) * scaleX,
                y: (touch.clientY - rect.top) * scaleY,
                pressure: (touch as unknown as { force?: number }).force || 0.5,
            };
        }

        // For mouse events, pressure is always 1 (no pressure sensitivity)
        const nativeEvent = e.nativeEvent as PointerEvent;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
            pressure: nativeEvent.pressure || 1,
        };
    };

    // Start drawing
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawer) return;

        const { x, y, pressure } = getCoordinates(e);
        setIsDrawing(true);
        currentStrokeRef.current = [{ x, y, pressure }];
        lastPointRef.current = { x, y };
        redoStackRef.current = []; // Clear redo stack on new stroke
    };

    // Continue drawing
    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !isDrawer) return;

        const ctx = contextRef.current;
        if (!ctx || !lastPointRef.current) return;

        const { x, y, pressure } = getCoordinates(e);
        currentStrokeRef.current.push({ x, y, pressure });

        // Draw line segment
        ctx.save();
        applyBrushToContext(ctx, currentBrush, pressure);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = brushSize * pressure;

        ctx.beginPath();
        const from = getJitteredPoint(lastPointRef.current.x, lastPointRef.current.y, currentBrush.jitter);
        const to = getJitteredPoint(x, y, currentBrush.jitter);
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        ctx.restore();

        lastPointRef.current = { x, y };
    };

    // End drawing
    const endDrawing = () => {
        if (!isDrawing || currentStrokeRef.current.length < 2) {
            setIsDrawing(false);
            return;
        }

        const stroke: DrawingStroke = {
            points: [...currentStrokeRef.current],
            brushType: currentBrush.id,
            color: currentColor,
            size: brushSize,
        };

        strokeHistoryRef.current.push(stroke);
        onStrokeComplete?.(stroke);

        setIsDrawing(false);
        currentStrokeRef.current = [];
        lastPointRef.current = null;
    };

    // Undo last stroke
    const undo = useCallback(() => {
        if (strokeHistoryRef.current.length === 0) return;

        const lastStroke = strokeHistoryRef.current.pop()!;
        redoStackRef.current.push(lastStroke);
        redrawCanvas();
    }, [redrawCanvas]);

    // Redo last undone stroke
    const redo = useCallback(() => {
        if (redoStackRef.current.length === 0) return;

        const stroke = redoStackRef.current.pop()!;
        strokeHistoryRef.current.push(stroke);
        redrawCanvas();
    }, [redrawCanvas]);

    // Clear canvas
    const clear = useCallback(() => {
        strokeHistoryRef.current = [];
        redoStackRef.current = [];
        redrawCanvas();
        onClear?.();
    }, [redrawCanvas, onClear]);

    // Add stroke from remote (for spectators)
    const addStroke = useCallback((stroke: DrawingStroke) => {
        strokeHistoryRef.current.push(stroke);
        const ctx = contextRef.current;
        if (ctx) {
            drawStrokeOnCanvas(ctx, stroke);
        }
    }, []);

    // Get canvas as base64 image
    const getImageData = useCallback(() => {
        return canvasRef.current?.toDataURL('image/png') || '';
    }, []);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        clear,
        undo,
        redo,
        addStroke,
        getImageData,
    }), [clear, undo, redo, addStroke, getImageData]);

    return (
        <div className={`relative ${className}`}>
            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className="rounded-2xl shadow-2xl cursor-crosshair touch-none"
                style={{
                    width: '100%',
                    maxWidth: width,
                    aspectRatio: `${width}/${height}`,
                    background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
            />

            {/* Toolbar (only for drawer) */}
            {isDrawer && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/10">
                    {/* Brush selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowBrushPanel(!showBrushPanel)}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            style={{ color: currentBrush.color }}
                        >
                            <Paintbrush size={20} />
                        </button>

                        {showBrushPanel && (
                            <div className="absolute bottom-12 left-0 p-3 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 min-w-[200px]">
                                <p className="text-xs text-white/60 mb-2 font-medium">Duygu Fırçaları</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.values(EMOTION_BRUSHES).map(brush => (
                                        <button
                                            key={brush.id}
                                            onClick={() => {
                                                setCurrentBrush(brush);
                                                setShowBrushPanel(false);
                                            }}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentBrush.id === brush.id
                                                ? 'bg-white/20 ring-2 ring-white/40'
                                                : 'hover:bg-white/10'
                                                }`}
                                            style={{ color: brush.color }}
                                        >
                                            {brush.nameTr}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-6 bg-white/20" />

                    {/* Color palette */}
                    <div className="flex gap-1">
                        {COLOR_PALETTE.slice(0, 8).map(color => (
                            <button
                                key={color}
                                onClick={() => setCurrentColor(color)}
                                className={`w-6 h-6 rounded-full transition-transform ${currentColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : ''
                                    }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-6 bg-white/20" />

                    {/* Brush size */}
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={e => setBrushSize(Number(e.target.value))}
                        className="w-20 accent-white/60"
                    />

                    {/* Divider */}
                    <div className="w-px h-6 bg-white/20" />

                    {/* Actions */}
                    <button onClick={undo} className="p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors">
                        <Undo2 size={18} />
                    </button>
                    <button onClick={redo} className="p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors">
                        <Redo2 size={18} />
                    </button>
                    <button onClick={clear} className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors">
                        <Trash2 size={18} />
                    </button>
                </div>
            )}
        </div>
    );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;
