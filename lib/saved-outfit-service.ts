import type { ClothingItem, GeneratedOutfit, WeatherData } from '@/types/clothing'

/**
 * Saved outfit structure
 */
export interface SavedOutfit {
  id: string
  userId: string
  name?: string
  note?: string
  
  // Outfit composition
  topId?: string
  bottomId?: string
  dressId?: string
  shoesId: string
  outerwearId?: string
  accessoryIds: string[]
  
  // Metadata
  createdAt: string
  lastWornDate?: string
  wearCount: number
  isFavorite: boolean
  weatherAtCreation?: WeatherData
  isManuallyCreated: boolean
}

/**
 * Service for managing saved outfits
 */
export class SavedOutfitService {
  private STORAGE_KEY = 'leora_saved_outfits'
  
  /**
   * Save a generated outfit
   */
  saveGeneratedOutfit(
    outfit: GeneratedOutfit, 
    userId: string,
    name?: string, 
    note?: string
  ): SavedOutfit {
    const saved: SavedOutfit = {
      id: crypto.randomUUID(),
      userId,
      name,
      note,
      topId: outfit.topId,
      bottomId: outfit.bottomId,
      dressId: outfit.dressId,
      shoesId: outfit.shoesId,
      outerwearId: outfit.outerwearId,
      accessoryIds: outfit.accessoryIds || [],
      createdAt: new Date().toISOString(),
      wearCount: 0,
      isFavorite: false,
      weatherAtCreation: outfit.weatherConditions,
      isManuallyCreated: false
    }
    
    this.save(saved)
    return saved
  }
  
  /**
   * Save a manually created outfit
   */
  saveManualOutfit(
    selection: {
      topId?: string
      bottomId?: string
      dressId?: string
      shoesId: string
      outerwearId?: string
      accessoryIds: string[]
    },
    userId: string,
    name?: string,
    note?: string
  ): SavedOutfit {
    const saved: SavedOutfit = {
      id: crypto.randomUUID(),
      userId,
      name,
      note,
      ...selection,
      createdAt: new Date().toISOString(),
      wearCount: 0,
      isFavorite: false,
      isManuallyCreated: true
    }
    
    this.save(saved)
    return saved
  }
  
  /**
   * Save outfit to storage
   */
  private save(outfit: SavedOutfit): void {
    const existing = this.getAll()
    const updated = [...existing, outfit]
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated))
  }
  
  /**
   * Get all saved outfits
   */
  getAll(): SavedOutfit[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }
  
  /**
   * Get outfits for specific user
   */
  getByUser(userId: string): SavedOutfit[] {
    return this.getAll().filter(o => o.userId === userId)
  }
  
  /**
   * Delete outfit
   */
  delete(id: string): void {
    const existing = this.getAll()
    const filtered = existing.filter(o => o.id !== id)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
  }
  
  /**
   * Mark outfit as worn
   */
  markAsWorn(id: string): void {
    const existing = this.getAll()
    const updated = existing.map(o => 
      o.id === id 
        ? { ...o, wearCount: o.wearCount + 1, lastWornDate: new Date().toISOString() }
        : o
    )
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated))
  }
  
  /**
   * Toggle favorite
   */
  toggleFavorite(id: string): void {
    const existing = this.getAll()
    const updated = existing.map(o => 
      o.id === id ? { ...o, isFavorite: !o.isFavorite } : o
    )
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated))
  }
  
  /**
   * Update outfit name/note
   */
  update(id: string, updates: { name?: string; note?: string }): void {
    const existing = this.getAll()
    const updated = existing.map(o => 
      o.id === id ? { ...o, ...updates } : o
    )
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated))
  }
}

// Export singleton instance
export const savedOutfitService = new SavedOutfitService()
