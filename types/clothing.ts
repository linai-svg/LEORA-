// Clothing and Outfit Types

export type ClothingCategory = 
  | 'top'
  | 'bottom'
  | 'dress'
  | 'outerwear'
  | 'shoes'
  | 'accessory'

export type ClothingStyle = 
  | 'casual'
  | 'formal'
  | 'business'
  | 'sporty'
  | 'elegant'
  | 'street'
  | 'bohemian'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export type FabricWeight = 'light' | 'medium' | 'heavy'

export type WeatherCondition = 
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'stormy'
  | 'snowy'
  | 'windy'

export interface ClothingItem {
  id: string
  userId: string
  
  // Image data
  imageUrl: string
  thumbnailUrl: string
  
  // Automatic detection
  category: ClothingCategory
  categoryConfidence: number
  
  // Extracted attributes
  dominantColor: string
  colors: string[]
  style: ClothingStyle[]
  season: Season[]
  fabricWeight: FabricWeight
  
  // User metadata
  name?: string
  brand?: string
  purchaseDate?: string
  lastWorn?: string
  wearCount: number
  
  // Organization
  isFavorite: boolean
  tags: string[]
  
  // Status
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface GeneratedOutfit {
  id: string
  userId: string
  
  // Clothing items in this outfit
  topId?: string
  bottomId?: string
  dressId?: string
  outerwearId?: string
  shoesId: string
  accessoryIds: string[]
  
  // Generation context
  generatedFor: string
  weatherConditions: WeatherData
  temperature: number
  isWeatherSuitable: boolean
  suitabilityWarning?: string
  
  // User actions
  status: 'suggested' | 'accepted' | 'rejected' | 'modified'
  userRating?: number
  wornDate?: string
  
  // Style attributes
  combinedStyle: ClothingStyle[]
  colorPalette: string[]
  
  createdAt: string
  acceptedAt?: string
}

export interface WeatherData {
  date: string
  temperature: number
  feelsLike: number
  condition: WeatherCondition
  precipitation: number
  windSpeed: number
  humidity: number
}

export interface CategoryResult {
  category: ClothingCategory
  confidence: number
}

export interface ColorAnalysis {
  dominantColor: string
  colors: string[]
  colorFamily: 'warm' | 'cool' | 'neutral'
}
