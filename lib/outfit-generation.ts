/**
 * STRICT RULE-BASED OUTFIT GENERATION
 * NO randomness - deterministic selection
 * Clear validation and error messages
 */

import type { ClothingItem, GeneratedOutfit, WeatherData } from '@/types/clothing'

/**
 * Validate wardrobe has minimum requirements
 */
export function validateWardrobe(items: ClothingItem[]): {
  isValid: boolean
  missingItems: string[]
  errorMessage: string
} {
  const tops = items.filter(i => i.category === 'top')
  const bottoms = items.filter(i => i.category === 'bottom')
  const dresses = items.filter(i => i.category === 'dress')
  const shoes = items.filter(i => i.category === 'shoes')
  
  const missing: string[] = []
  
  // RULE 1: Shoes are MANDATORY
  if (shoes.length === 0) {
    missing.push('shoes')
  }
  
  // RULE 2: Need (Top + Bottom) OR Dress
  const hasTopBottom = tops.length > 0 && bottoms.length > 0
  const hasDress = dresses.length > 0
  
  if (!hasTopBottom && !hasDress) {
    if (tops.length === 0 && bottoms.length === 0) {
      missing.push('top and bottom OR dress')
    } else if (tops.length === 0) {
      missing.push('top')
    } else if (bottoms.length === 0) {
      missing.push('bottom')
    }
  }
  
  let errorMessage = ''
  if (missing.length === 0) {
    errorMessage = ''
  } else if (missing.length === 1) {
    errorMessage = `Add ${missing[0]} to generate an outfit`
  } else {
    errorMessage = `Add ${missing.join(', ')} to generate an outfit`
  }
  
  return {
    isValid: missing.length === 0,
    missingItems: missing,
    errorMessage
  }
}

/**
 * Get mock weather for testing
 */
export function getMockWeather(date?: string): WeatherData {
  const now = date ? new Date(date) : new Date()
  const month = now.getMonth()
  
  if (month >= 5 && month <= 7) {
    return { date: now.toISOString(), temperature: 28, feelsLike: 30, condition: 'sunny', precipitation: 0, windSpeed: 10, humidity: 60 }
  }
  if (month === 11 || month <= 1) {
    return { date: now.toISOString(), temperature: 8, feelsLike: 5, condition: 'cloudy', precipitation: 10, windSpeed: 20, humidity: 80 }
  }
  return { date: now.toISOString(), temperature: 16, feelsLike: 16, condition: 'cloudy', precipitation: 5, windSpeed: 15, humidity: 70 }
}

/**
 * Generate outfit - STRICT RULES
 * @param forcedItems - Array of item IDs that MUST be included
 */
export function generateOutfit(
  items: ClothingItem[],
  date: string,
  userId: string,
  forcedItems: string[] = []
): GeneratedOutfit | null {
  
  console.log('[v0] ===== OUTFIT GENERATION START =====')
  console.log('[v0] Items:', items.length)
  
  // STEP 1: Validate
  const validation = validateWardrobe(items)
  if (!validation.isValid) {
    console.log('[v0] FAIL:', validation.errorMessage)
    return null
  }
  
  // STEP 2: Get weather
  const weather = getMockWeather()
  console.log('[v0] Weather:', weather.temperature + '°C')
  
  // STEP 3: Categorize
  const tops = items.filter(i => i.category === 'top')
  const bottoms = items.filter(i => i.category === 'bottom')
  const dresses = items.filter(i => i.category === 'dress')
  const shoes = items.filter(i => i.category === 'shoes')
  const outerwear = items.filter(i => i.category === 'outerwear')
  const accessories = items.filter(i => i.category === 'accessory')
  
  console.log('[v0] Available:', { tops: tops.length, bottoms: bottoms.length, dresses: dresses.length, shoes: shoes.length, outerwear: outerwear.length, accessories: accessories.length })
  
  // STEP 4: Handle forced items
  const forcedMap = new Map<string, ClothingItem>()
  for (const id of forcedItems) {
    const item = items.find(i => i.id === id)
    if (item) {
      forcedMap.set(item.category, item)
      console.log('[v0] FORCED ITEM:', item.category, id)
    }
  }
  
  // STEP 5: Build outfit with forced items
  let outfit: Partial<GeneratedOutfit> = {}
  
  // Check if forced items dictate dress vs top+bottom
  const hasForcedDress = forcedMap.has('dress')
  const hasForcedTop = forcedMap.has('top')
  const hasForcedBottom = forcedMap.has('bottom')
  
  if (hasForcedDress) {
    console.log('[v0] Building DRESS outfit (forced)')
    outfit.dressId = forcedMap.get('dress')!.id
    outfit.shoesId = forcedMap.get('shoes')?.id || selectBest(shoes).id
  } else if (hasForcedTop || hasForcedBottom) {
    console.log('[v0] Building TOP+BOTTOM outfit (forced)')
    outfit.topId = forcedMap.get('top')?.id || (tops.length > 0 ? selectBest(tops).id : undefined)
    outfit.bottomId = forcedMap.get('bottom')?.id || (bottoms.length > 0 ? selectBest(bottoms).id : undefined)
    outfit.shoesId = forcedMap.get('shoes')?.id || selectBest(shoes).id
    
    // Validate we have both
    if (!outfit.topId || !outfit.bottomId) {
      console.log('[v0] FAIL: Cannot build top+bottom outfit with forced items')
      return null
    }
  } else {
    // No forced base items, use normal logic
    if (tops.length > 0 && bottoms.length > 0) {
      console.log('[v0] Building TOP+BOTTOM outfit')
      outfit.topId = selectBest(tops).id
      outfit.bottomId = selectBest(bottoms).id
      outfit.shoesId = forcedMap.get('shoes')?.id || selectBest(shoes).id
    } else if (dresses.length > 0) {
      console.log('[v0] Building DRESS outfit')
      outfit.dressId = selectBest(dresses).id
      outfit.shoesId = forcedMap.get('shoes')?.id || selectBest(shoes).id
    } else {
      console.log('[v0] FAIL: No valid outfit structure')
      return null
    }
  }
  
  // Apply forced outerwear
  if (forcedMap.has('outerwear')) {
    outfit.outerwearId = forcedMap.get('outerwear')!.id
  }
  
  // Apply accessories (up to 3 random accessories)
  const selectedAccessories: string[] = []
  if (accessories.length > 0) {
    const numAccessories = Math.min(3, accessories.length)
    const shuffled = [...accessories].sort(() => Math.random() - 0.5)
    for (let i = 0; i < numAccessories; i++) {
      selectedAccessories.push(shuffled[i].id)
    }
  }
  
  // STEP 5: Weather rules
  let warning: string | undefined
  let suitable = true
  
  if (weather.temperature < 12) {
    // COLD: need jacket
    if (outerwear.length === 0) {
      warning = 'Too cold! Add a jacket to your wardrobe.'
      suitable = false
    } else {
      outfit.outerwearId = selectBest(outerwear).id
    }
  } else if (weather.temperature < 18 && outerwear.length > 0) {
    outfit.outerwearId = selectBest(outerwear).id
  }
  
  console.log('[v0] SUCCESS')
  console.log('[v0] ===== OUTFIT GENERATION END =====')
  
  return {
    id: crypto.randomUUID(),
    userId,
    topId: outfit.topId,
    bottomId: outfit.bottomId,
    dressId: outfit.dressId,
    outerwearId: outfit.outerwearId,
    shoesId: outfit.shoesId!,
    accessoryIds: selectedAccessories,
    generatedFor: date,
    weatherConditions: weather,
    temperature: weather.temperature,
    isWeatherSuitable: suitable,
    suitabilityWarning: warning,
    status: 'suggested',
    combinedStyle: ['casual'],
    colorPalette: [],
    createdAt: new Date().toISOString()
  }
}

/**
 * Select best item (favorites > most worn)
 * Uses weighted random to allow variation while preferring better items
 */
function selectBest<T extends ClothingItem>(items: T[]): T {
  if (items.length === 1) return items[0]
  
  // Sort by priority (favorites first, then most worn)
  const sorted = [...items].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    return b.wearCount - a.wearCount
  })
  
  // Weighted random selection (favor top items but allow variety)
  // Top item has 50% chance, second 25%, third 12.5%, etc.
  const rand = Math.random()
  let cumulative = 0
  for (let i = 0; i < sorted.length; i++) {
    cumulative += Math.pow(0.5, i + 1)
    if (rand < cumulative) {
      return sorted[i]
    }
  }
  
  return sorted[0]
}

/**
 * Get weather icon for display
 */
export function getWeatherIcon(condition: string): string {
  const icons: Record<string, string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    stormy: '⛈️',
    snowy: '❄️',
    windy: '💨'
  }
  return icons[condition] || '☁️'
}
