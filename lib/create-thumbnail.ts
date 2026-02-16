import type { Stroke } from "@/types"

/**
 * Create a thumbnail image from canvas strokes
 * Used for preview purposes in study pages
 */
export function createThumbnail(
  strokes: Stroke[],
  width: number,
  height: number
): string {
  if (strokes.length === 0) {
    return ''
  }

  // Create smaller canvas for thumbnail
  const thumbWidth = 200
  const thumbHeight = 150
  const scaleX = thumbWidth / width
  const scaleY = thumbHeight / height

  const canvas = document.createElement('canvas')
  canvas.width = thumbWidth
  canvas.height = thumbHeight
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return ''
  }

  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, thumbWidth, thumbHeight)

  // Draw strokes scaled down
  strokes.forEach((stroke) => {
    ctx.beginPath()
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width * Math.min(scaleX, scaleY)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = stroke.opacity

    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
    } else {
      ctx.globalCompositeOperation = 'source-over'
    }

    stroke.points.forEach((point, index) => {
      const x = point.x * scaleX
      const y = point.y * scaleY

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()
  })

  // Return as data URL
  try {
    return canvas.toDataURL('image/png', 0.7)
  } catch (error) {
    console.error('Failed to create thumbnail:', error)
    return ''
  }
}
