import type { Stroke } from "@/types"

/**
 * Convert canvas strokes to a base64 PNG image
 * Upscales for better OCR accuracy
 */
export function strokesToImage(
  strokes: Stroke[],
  width: number,
  height: number
): string {
  console.log('[v0] Converting strokes to image, stroke count:', strokes.length)
  
  // Upscale by 2x for better OCR recognition
  const scale = 2
  const scaledWidth = width * scale
  const scaledHeight = height * scale
  
  const canvas = document.createElement('canvas')
  canvas.width = scaledWidth
  canvas.height = scaledHeight
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    console.error('[v0] Failed to get canvas context')
    return ''
  }

  // Scale context for higher resolution
  ctx.scale(scale, scale)

  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  // Draw all strokes
  strokes.forEach((stroke, strokeIndex) => {
    console.log(`[v0] Drawing stroke ${strokeIndex + 1}/${strokes.length}, points: ${stroke.points.length}`)
    
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
        const prevPoint = stroke.points[index - 1]
        const midX = (prevPoint.x + point.x) / 2
        const midY = (prevPoint.y + point.y) / 2
        ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY)
      }
    })

    ctx.stroke()
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
  })

  const dataUrl = canvas.toDataURL('image/png')
  console.log('[v0] Image generated, data URL length:', dataUrl.length)
  return dataUrl
}

/**
 * Preprocess image for better OCR accuracy
 * Applies contrast enhancement and noise reduction
 */
export async function preprocessImage(imageData: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        resolve(imageData)
        return
      }

      // Draw image
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = data.data

      // Step 1: Increase contrast with adaptive thresholding
      // This works better for handwriting than simple threshold
      const threshold = 200 // Higher threshold for better text detection
      
      for (let i = 0; i < pixels.length; i += 4) {
        const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
        
        // Make text darker, background whiter
        const enhanced = avg < threshold ? 0 : 255
        pixels[i] = enhanced     // R
        pixels[i + 1] = enhanced // G
        pixels[i + 2] = enhanced // B
        // Keep alpha
      }

      ctx.putImageData(data, 0, 0)
      
      // Step 2: Apply slight blur to reduce noise
      ctx.filter = 'blur(0.5px)'
      ctx.drawImage(canvas, 0, 0)
      ctx.filter = 'none'
      
      resolve(canvas.toDataURL('image/png'))
    }
    
    img.onerror = () => {
      console.error('[v0] Failed to load image for preprocessing')
      resolve(imageData)
    }
    
    img.src = imageData
  })
}

/**
 * Client-side OCR using Tesseract.js
 * Optimized for handwriting recognition
 */
export async function recognizeTextLocal(imageData: string): Promise<string> {
  console.log('[v0] Starting OCR recognition...')
  
  try {
    // Preprocess image for better OCR accuracy
    console.log('[v0] Preprocessing image...')
    const processedImage = await preprocessImage(imageData)
    console.log('[v0] Image preprocessed')
    
    // Dynamic import to reduce bundle size
    const { createWorker } = await import('tesseract.js')
    
    console.log('[v0] Tesseract.js loaded, creating worker...')
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log('[v0] Tesseract progress:', Math.round(m.progress * 100) + '%')
        }
      }
    })
    
    // Configure worker for better handwriting recognition
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?-:;()\'"',
    })
    
    console.log('[v0] Worker configured, starting recognition...')
    const { data: { text, confidence } } = await worker.recognize(processedImage)
    
    console.log('[v0] Recognition complete')
    console.log('[v0] Confidence:', Math.round(confidence) + '%')
    console.log('[v0] Text length:', text.length)
    console.log('[v0] Recognized text preview:', text.substring(0, 150))
    
    await worker.terminate()
    console.log('[v0] Worker terminated')
    
    const trimmedText = text.trim()
    
    if (!trimmedText || trimmedText.length < 2) {
      console.warn('[v0] OCR returned empty or very short text')
      return 'No text could be recognized. Please write larger and more clearly, or try printing your letters.'
    }
    
    if (confidence < 30) {
      console.warn('[v0] Low confidence recognition:', confidence)
      return `${trimmedText}\n\n(Note: Low confidence - please verify accuracy)`
    }
    
    return trimmedText
  } catch (error) {
    console.error('[v0] Local OCR error:', error)
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        return 'Error: Cannot load OCR engine. Please check your internet connection and try again.'
      }
      if (error.message.includes('out of memory')) {
        return 'Error: Not enough memory for OCR. Try clearing the canvas and writing less text.'
      }
      return `Error: ${error.message}`
    }
    
    return 'Error: OCR processing failed. Please try again.'
  }
}

/**
 * Create thumbnail from strokes
 */
export function createThumbnail(
  strokes: Stroke[],
  width: number,
  height: number,
  thumbWidth: number = 200,
  thumbHeight: number = 150
): string {
  const canvas = document.createElement('canvas')
  canvas.width = thumbWidth
  canvas.height = thumbHeight
  const ctx = canvas.getContext('2d')

  if (!ctx) return ''

  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, thumbWidth, thumbHeight)

  // Calculate scale
  const scaleX = thumbWidth / width
  const scaleY = thumbHeight / height
  const scale = Math.min(scaleX, scaleY)

  ctx.scale(scale, scale)

  // Draw strokes
  strokes.forEach((stroke) => {
    ctx.beginPath()
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = stroke.opacity

    stroke.points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        const prevPoint = stroke.points[index - 1]
        const midX = (prevPoint.x + point.x) / 2
        const midY = (prevPoint.y + point.y) / 2
        ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY)
      }
    })

    ctx.stroke()
  })

  return canvas.toDataURL('image/png')
}
