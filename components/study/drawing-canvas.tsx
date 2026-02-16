"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Pen, Eraser, Trash2, Undo, Type } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Stroke, Point } from "@/types"

interface DrawingCanvasProps {
  strokes: Stroke[]
  onStrokesChange: (strokes: Stroke[]) => void
  width?: number
  height?: number
}

const colors = [
  { name: "Black", value: "#000000" },
  { name: "Blue", value: "#2563eb" },
  { name: "Red", value: "#dc2626" },
  { name: "Green", value: "#16a34a" },
  { name: "Purple", value: "#9333ea" },
]

export function DrawingCanvas({
  strokes,
  onStrokesChange,
  width = 800,
  height = 600,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentStroke, setCurrentStroke] = useState<Point[]>([])
  const [selectedTool, setSelectedTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen')
  const [selectedColor, setSelectedColor] = useState(colors[0].value)
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [sessionStart] = useState(Date.now())

  // Redraw all strokes when they change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw all strokes
    strokes.forEach((stroke) => {
      ctx.beginPath()
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalAlpha = stroke.opacity

      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.lineWidth = stroke.width * 3
      } else {
        ctx.globalCompositeOperation = 'source-over'
      }

      stroke.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          // Smooth curve using quadratic curves
          const prevPoint = stroke.points[index - 1]
          const midX = (prevPoint.x + point.x) / 2
          const midY = (prevPoint.y + point.y) / 2
          ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY)
        }
      })

      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    })
  }, [strokes])

  const getCanvasPoint = useCallback((e: PointerEvent): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0, pressure: 0.5, timestamp: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      pressure: e.pressure || 0.5,
      timestamp: Date.now() - sessionStart,
    }
  }, [sessionStart])

  const handlePointerDown = useCallback((e: PointerEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    // Capture pointer for better tracking
    canvas.setPointerCapture(e.pointerId)

    const point = getCanvasPoint(e)
    setCurrentStroke([point])
    setIsDrawing(true)
  }, [getCanvasPoint])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDrawing) return
    e.preventDefault()

    const point = getCanvasPoint(e)
    setCurrentStroke((prev) => [...prev, point])

    // Draw current stroke immediately for visual feedback
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx || currentStroke.length === 0) return

    const prevPoint = currentStroke[currentStroke.length - 1]
    
    ctx.beginPath()
    ctx.strokeStyle = selectedColor
    ctx.lineWidth = strokeWidth * (selectedTool === 'eraser' ? 3 : 1)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = selectedTool === 'highlighter' ? 0.3 : 1

    if (selectedTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
    } else {
      ctx.globalCompositeOperation = 'source-over'
    }

    ctx.moveTo(prevPoint.x, prevPoint.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()

    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }, [isDrawing, currentStroke, getCanvasPoint, selectedColor, strokeWidth, selectedTool])

  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (!isDrawing) return
    e.preventDefault()

    const canvas = canvasRef.current
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId)
    }

    if (currentStroke.length > 0) {
      const newStroke: Stroke = {
        id: crypto.randomUUID(),
        points: currentStroke,
        color: selectedColor,
        width: strokeWidth,
        opacity: selectedTool === 'highlighter' ? 0.3 : 1,
        tool: selectedTool,
      }

      onStrokesChange([...strokes, newStroke])
    }

    setIsDrawing(false)
    setCurrentStroke([])
  }, [isDrawing, currentStroke, selectedColor, strokeWidth, selectedTool, strokes, onStrokesChange])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerup', handlePointerUp)
    canvas.addEventListener('pointercancel', handlePointerUp)

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerup', handlePointerUp)
      canvas.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [handlePointerDown, handlePointerMove, handlePointerUp])

  const handleUndo = () => {
    if (strokes.length > 0) {
      onStrokesChange(strokes.slice(0, -1))
    }
  }

  const handleClear = () => {
    if (confirm('Clear all strokes? This cannot be undone.')) {
      onStrokesChange([])
  }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          {/* Tool Selection */}
          <Button
            variant={selectedTool === 'pen' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTool('pen')}
          >
            <Pen className="h-4 w-4" />
          </Button>
          <Button
            variant={selectedTool === 'highlighter' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTool('highlighter')}
          >
            <Pen className="h-4 w-4 opacity-50" />
          </Button>
          <Button
            variant={selectedTool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTool('eraser')}
          >
            <Eraser className="h-4 w-4" />
          </Button>

          {/* Color Selection */}
          {selectedTool !== 'eraser' && (
            <div className="flex items-center gap-1 ml-4">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    selectedColor === color.value ? "border-primary scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
          )}

          {/* Stroke Width */}
          {selectedTool !== 'eraser' && (
            <div className="flex items-center gap-1 ml-4">
              {[1, 2, 4].map((width) => (
                <button
                  key={width}
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded flex items-center justify-center transition-colors",
                    strokeWidth === width ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => setStrokeWidth(width)}
                >
                  <div
                    className="rounded-full bg-current"
                    style={{ width: width * 2, height: width * 2 }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleUndo} disabled={strokes.length === 0}>
            <Undo className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear} disabled={strokes.length === 0}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>

        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-white rounded-lg shadow-soft overflow-hidden border border-border">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full touch-none"
          style={{ cursor: selectedTool === 'eraser' ? 'crosshair' : 'crosshair' }}
        />
        {strokes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted-foreground text-sm">Start writing or drawing...</p>
          </div>
        )}
      </div>
    </div>
  )
}
