/**
 * Clothing Processing - MANUAL CATEGORY SELECTION ONLY
 * NO automatic detection - user chooses category
 */

import type { ClothingItem, ClothingCategory } from '@/types/clothing'

/**
 * Extract dominant color from image (ONLY automated analysis)
 */
export async function extractDominantColor(imageData: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        resolve('#808080')
        return
      }
      
      canvas.width = 50
      canvas.height = 50
      ctx.drawImage(img, 0, 0, 50, 50)
      
      const data = ctx.getImageData(0, 0, 50, 50).data
      
      let r = 0, g = 0, b = 0
      const pixels = data.length / 4
      
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
      }
      
      r = Math.round(r / pixels)
      g = Math.round(g / pixels)
      b = Math.round(b / pixels)
      
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
      resolve(hex)
    }
    
    img.onerror = () => resolve('#808080')
    img.src = imageData
  })
}

/**
 * Create clothing item from photo with MANUAL category
 */
export async function createClothingItem(
  imageData: string,
  category: ClothingCategory,
  userId: string
): Promise<ClothingItem> {
  
  console.log('[v0] Creating item - Category MANUALLY selected:', category)
  
  const dominantColor = await extractDominantColor(imageData)
  const thumbnailUrl = await createThumbnail(imageData)
  
  return {
    id: crypto.randomUUID(),
    userId,
    imageUrl: imageData,
    thumbnailUrl,
    category, // USER SELECTED
    categoryConfidence: 100, // Always 100 - user chose it
    dominantColor,
    colors: [dominantColor],
    style: ['casual'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    fabricWeight: 'medium',
    wearCount: 0,
    isFavorite: false,
    tags: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Create thumbnail
 */
async function createThumbnail(imageData: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        resolve(imageData)
        return
      }
      
      const size = 200
      let width = img.width
      let height = img.height
      
      if (width > height) {
        if (width > size) {
          height = (height * size) / width
          width = size
        }
      } else {
        if (height > size) {
          width = (width * size) / height
          height = size
        }
      }
      
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    
    img.onerror = () => resolve(imageData)
    img.src = imageData
  })
}

/**
 * Convert file to base64
 */
export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
