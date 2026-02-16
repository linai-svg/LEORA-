import type { ClothingItem, GeneratedOutfit, WeatherData } from '@/types/clothing'
import type { SavedOutfit } from './saved-outfit-service'

/**
 * Leora Expression States
 */
type LeoraState = 'happy' | 'excited' | 'neutral' | 'critical' | 'encouraging'

/**
 * Track last used messages to avoid repetition
 */
let lastMessages: string[] = []

/**
 * RICH LEORA PERSONALITY SYSTEM
 * Multiple variations per state with no consecutive repeats
 */
const LEORA_EXPRESSIONS = {
  happy: [
    "This outfit is absolutely perfect! You've got great taste!",
    "Love it! The colors work so well together!",
    "Fantastic choice! This combination is on point!",
    "You're nailing it with this outfit!",
    "Beautiful! This is such a well-balanced look!",
    "Gorgeous combination! You look amazing in this!",
    "This is fire! Such a stylish outfit!",
    "Perfect harmony! Everything works together beautifully!",
    "Yes! This is exactly the right vibe!",
    "Stunning! I'm loving every piece of this outfit!",
    "Chef's kiss! This outfit is flawless!",
    "Incredible! You have such an eye for style!"
  ],
  excited: [
    "Wow! This is such a bold and confident choice!",
    "Ooh, I love where you're going with this!",
    "This is going to turn heads! So stylish!",
    "Yes yes yes! This outfit has serious energy!",
    "Oh this is fun! Love the adventurous spirit!",
    "Fantastic! You're really pushing your style boundaries!",
    "This is so you! Authentic and amazing!",
    "I'm here for this look! So creative!",
    "What a statement! This outfit speaks volumes!",
    "You're bringing something special with this one!",
    "This has main character energy written all over it!",
    "Absolutely brilliant! You're thinking outside the box!"
  ],
  neutral: [
    "Nice outfit! This works well.",
    "Solid choice. Clean and put-together.",
    "This is a good, reliable look.",
    "Safe and stylish. Nothing wrong with that!",
    "Classic combination. Always works.",
    "Simple and effective. Well done.",
    "This gets the job done nicely.",
    "A dependable outfit choice.",
    "Practical and presentable. Good!",
    "This works. Clean lines, good balance.",
    "Straightforward and stylish.",
    "A solid everyday look."
  ],
  critical: [
    "Hmm, these colors might clash a bit. Maybe try something else?",
    "This could work, but consider swapping the shoes for better balance.",
    "I see what you're going for, but the top and bottom compete a bit.",
    "These pieces are nice separately, but together they don't quite gel.",
    "The proportions feel a bit off. Maybe try different pants?",
    "This is close! But I think one piece needs to change.",
    "The colors don't harmonize as well as they could. Try a different top?",
    "Good start, but this needs one more adjustment to really work.",
    "These textures are fighting each other. Consider a smoother piece?",
    "The vibe is mixed here. Pick one aesthetic and lean into it!",
    "I want to love this, but something's not clicking. Try again?",
    "Close but not quite there. One swap would make this perfect!"
  ],
  encouraging: [
    "Great base! Now let's build on it with some accessories.",
    "You're on the right track! Maybe add a jacket?",
    "Nice start! Consider layering to elevate this look.",
    "This has potential! A scarf or bag could complete it.",
    "Good foundation! Now let's add some personality with accessories.",
    "You're almost there! One more piece will make this pop.",
    "Solid choice! Ready to take it to the next level?",
    "This works! Want to make it even better with a jacket?",
    "Looking good! A few accessories would really finish this off.",
    "Great combo! Now let's think about how to accessorize.",
    "Nice! This outfit is asking for one more special touch.",
    "You're building something good here! Keep going!"
  ]
}

const WEATHER_MESSAGES = {
  tooColdNoJacket: [
    "Brrr! It's {temp}°C outside. You definitely need a jacket!",
    "Way too cold without outerwear! Add a jacket to stay warm.",
    "At {temp}°C, a jacket isn't optional - it's essential!",
    "Bundle up! This weather calls for serious layers.",
    "Cold alert! Please grab a jacket before heading out."
  ],
  tooHotWithJacket: [
    "It's {temp}°C! Way too hot for a jacket today.",
    "Skip the jacket! It's scorching at {temp}°C.",
    "That jacket will be uncomfortable in this heat. Lose it!",
    "Hot day ahead! Ditch the outerwear.",
    "At {temp}°C, you'll roast in that jacket!"
  ],
  rainy: [
    "Rain incoming! A jacket would be smart.",
    "Looks like rain. Better grab some weather protection!",
    "Rainy day ahead - outerwear recommended!",
    "Don't get caught in the rain without a jacket!",
    "Wet weather alert! Layer up with a jacket."
  ],
  perfect: [
    "Perfect weather for this outfit!",
    "This matches the weather beautifully!",
    "Ideal outfit for today's conditions!",
    "Weather and outfit in perfect harmony!",
    "You're dressed perfectly for this weather!"
  ]
}

const COLOR_MESSAGES = {
  monochrome: [
    "Monochrome magic! All one color family - so chic!",
    "I love this tonal look. Very sophisticated!",
    "Single-color palette = instant elegance!",
    "This monochrome vibe is strong! Love it!",
    "Color blocking done right! Cohesive and clean!"
  ],
  complementary: [
    "These colors are perfect opposites! Great color theory!",
    "Love the complementary colors - they really pop together!",
    "This color combination has serious impact!",
    "Opposite colors on the wheel = visual harmony!",
    "Bold color pairing! It totally works!"
  ],
  clashing: [
    "These colors are fighting each other. Try something different?",
    "The color mix feels chaotic. Maybe stick to 2-3 colors?",
    "This palette needs some editing. Too much going on!",
    "Colors competing for attention. Simplify a bit?",
    "Let's find some calmer color harmony here."
  ]
}

const BALANCE_MESSAGES = {
  needsAccessories: [
    "Solid base! Accessories would elevate this.",
    "Good start! Now add some personality with accessories.",
    "This is asking for a statement piece or two!",
    "Complete this with a bag or scarf!",
    "Accessories could take this from good to great!"
  ],
  wellBalanced: [
    "Perfect balance between all the pieces!",
    "Everything proportioned just right!",
    "Great visual weight distribution!",
    "This outfit has excellent harmony!",
    "All elements working together beautifully!"
  ],
  needsLayer: [
    "Consider adding a layer for more dimension.",
    "A jacket or cardigan would add depth here.",
    "This could use one more layer for interest.",
    "Think about adding outerwear to complete the look.",
    "Layering would give this outfit more sophistication."
  ]
}

/**
 * Get random message without repeating last 3
 */
function getRandomMessage(messages: string[], context?: string): string {
  // Filter out recently used messages
  const available = messages.filter(msg => !lastMessages.includes(msg))
  
  // If all messages were used, reset
  const pool = available.length > 0 ? available : messages
  
  // Select random
  let selected = pool[Math.floor(Math.random() * pool.length)]
  
  // Replace context variables
  if (context) {
    selected = selected.replace('{temp}', context)
  }
  
  // Track usage
  lastMessages.push(selected)
  if (lastMessages.length > 3) {
    lastMessages.shift()
  }
  
  return selected
}

/**
 * Determine Leora's state based on outfit analysis
 */
function determineLeoraState(
  outfit: SavedOutfit | GeneratedOutfit,
  wardrobe: ClothingItem[],
  weather: WeatherData
): { state: LeoraState; reason: string } {
  
  const items = getOutfitItems(outfit, wardrobe)
  const colors = items.map(i => i.dominantColor)
  const hasJacket = !!outfit.outerwearId
  const hasAccessories = outfit.accessoryIds && outfit.accessoryIds.length > 0
  
  // CRITICAL: Weather mismatch
  if (weather.temperature < 12 && !hasJacket) {
    return { state: 'critical', reason: 'cold-no-jacket' }
  }
  
  if (weather.temperature > 30 && hasJacket) {
    return { state: 'critical', reason: 'hot-with-jacket' }
  }
  
  // EXCITED: Perfect weather match + good colors
  if (weather.temperature >= 15 && weather.temperature <= 25) {
    if (hasComplementaryColors(colors) || allSameColorFamily(colors)) {
      return { state: 'excited', reason: 'perfect-combo' }
    }
  }
  
  // HAPPY: Good color harmony
  if (hasComplementaryColors(colors) || allSameColorFamily(colors)) {
    return { state: 'happy', reason: 'color-harmony' }
  }
  
  // ENCOURAGING: Missing accessories or layer
  if (!hasAccessories && items.length <= 3) {
    return { state: 'encouraging', reason: 'needs-accessories' }
  }
  
  if (weather.temperature < 18 && !hasJacket && outfit.outerwearId !== undefined) {
    return { state: 'encouraging', reason: 'needs-layer' }
  }
  
  // CRITICAL: Too many competing colors
  if (hasTooManyColors(colors)) {
    return { state: 'critical', reason: 'color-clash' }
  }
  
  // NEUTRAL: Everything is fine
  return { state: 'neutral', reason: 'standard' }
}

/**
 * Generate rich, context-aware Leora feedback
 */
export function generateLeoraFeedback(
  outfit: SavedOutfit | GeneratedOutfit,
  wardrobe: ClothingItem[],
  weather: WeatherData,
  isRegenerated?: boolean
): string {
  
  console.log('[v0] Generating Leora feedback...')
  
  const { state, reason } = determineLeoraState(outfit, wardrobe, weather)
  const items = getOutfitItems(outfit, wardrobe)
  const colors = items.map(i => i.dominantColor)
  const hasJacket = !!outfit.outerwearId
  const hasAccessories = outfit.accessoryIds && outfit.accessoryIds.length > 0
  
  console.log('[v0] Leora state:', state, 'reason:', reason)
  
  // REGENERATION SPECIAL MESSAGES
  if (isRegenerated) {
    const regenMessages = [
      "Ooh, trying something new! I like the fresh take!",
      "Different vibe this time! Let's see...",
      "Switching it up! Okay, I'm intrigued!",
      "New combination incoming! Let's analyze this!",
      "Round two! This is exciting!"
    ]
    const regenIntro = getRandomMessage(regenMessages)
    const mainFeedback = getMainFeedback(state, reason, weather, colors, hasJacket, hasAccessories)
    return `${regenIntro} ${mainFeedback}`
  }
  
  return getMainFeedback(state, reason, weather, colors, hasJacket, hasAccessories)
}

/**
 * Get main feedback message
 */
function getMainFeedback(
  state: LeoraState,
  reason: string,
  weather: WeatherData,
  colors: string[],
  hasJacket: boolean,
  hasAccessories: boolean
): string {
  
  // Weather-critical messages take priority
  if (reason === 'cold-no-jacket') {
    return getRandomMessage(WEATHER_MESSAGES.tooColdNoJacket, weather.temperature.toString())
  }
  
  if (reason === 'hot-with-jacket') {
    return getRandomMessage(WEATHER_MESSAGES.tooHotWithJacket, weather.temperature.toString())
  }
  
  if (weather.condition === 'rainy' && !hasJacket) {
    return getRandomMessage(WEATHER_MESSAGES.rainy)
  }
  
  // Color-specific messages
  if (allSameColorFamily(colors)) {
    return getRandomMessage(COLOR_MESSAGES.monochrome)
  }
  
  if (hasComplementaryColors(colors)) {
    return getRandomMessage(COLOR_MESSAGES.complementary)
  }
  
  if (hasTooManyColors(colors)) {
    return getRandomMessage(COLOR_MESSAGES.clashing)
  }
  
  // Balance messages
  if (!hasAccessories && reason === 'needs-accessories') {
    return getRandomMessage(BALANCE_MESSAGES.needsAccessories)
  }
  
  if (!hasJacket && reason === 'needs-layer') {
    return getRandomMessage(BALANCE_MESSAGES.needsLayer)
  }
  
  // State-based messages
  return getRandomMessage(LEORA_EXPRESSIONS[state])
}

/**
 * Get clothing items from outfit
 */
function getOutfitItems(
  outfit: SavedOutfit | GeneratedOutfit,
  wardrobe: ClothingItem[]
): ClothingItem[] {
  const items: ClothingItem[] = []
  
  if (outfit.topId) {
    const top = wardrobe.find(i => i.id === outfit.topId)
    if (top) items.push(top)
  }
  
  if (outfit.bottomId) {
    const bottom = wardrobe.find(i => i.id === outfit.bottomId)
    if (bottom) items.push(bottom)
  }
  
  if (outfit.dressId) {
    const dress = wardrobe.find(i => i.id === outfit.dressId)
    if (dress) items.push(dress)
  }
  
  if (outfit.shoesId) {
    const shoes = wardrobe.find(i => i.id === outfit.shoesId)
    if (shoes) items.push(shoes)
  }
  
  if (outfit.outerwearId) {
    const outerwear = wardrobe.find(i => i.id === outfit.outerwearId)
    if (outerwear) items.push(outerwear)
  }
  
  return items
}

/**
 * Check if colors are in same family
 */
function allSameColorFamily(colors: string[]): boolean {
  if (colors.length < 2) return false
  
  const hues = colors.map(hexToHue)
  const maxDiff = Math.max(...hues) - Math.min(...hues)
  return maxDiff < 30
}

/**
 * Check if colors are complementary
 */
function hasComplementaryColors(colors: string[]): boolean {
  const hues = colors.map(hexToHue)
  
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      const diff = Math.abs(hues[i] - hues[j])
      if (diff > 150 && diff < 210) {
        return true
      }
    }
  }
  return false
}

/**
 * Check if too many competing colors
 */
function hasTooManyColors(colors: string[]): boolean {
  if (colors.length < 3) return false
  
  const hues = colors.map(hexToHue)
  const uniqueHues = hues.filter((h, i, arr) => 
    arr.findIndex(h2 => Math.abs(h - h2) < 30) === i
  )
  
  return uniqueHues.length > 3
}

/**
 * Convert hex color to hue value
 */
function hexToHue(hex: string): number {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  
  if (delta === 0) return 0
  
  let hue = 0
  if (max === r) {
    hue = ((g - b) / delta) % 6
  } else if (max === g) {
    hue = (b - r) / delta + 2
  } else {
    hue = (r - g) / delta + 4
  }
  
  return hue * 60
}
