/**
 * Photo Dump 24h Streak System
 * 
 * RULES:
 * - Streak increases when user adds at least ONE photo within 24h
 * - Both private and shared photos count equally
 * - Streak resets ONLY if more than 24h pass without adding a photo
 * - No pressure, calm and positive
 */

export interface PhotoStreak {
  currentStreak: number
  lastPhotoDate: string | null
  longestStreak: number
  totalPhotos: number
}

const STORAGE_KEY = 'leora_photo_streak'
const STREAK_WINDOW_HOURS = 24

/**
 * Get current streak data
 */
export function getPhotoStreak(): PhotoStreak {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      return {
        currentStreak: 0,
        lastPhotoDate: null,
        longestStreak: 0,
        totalPhotos: 0
      }
    }
    return JSON.parse(data)
  } catch {
    return {
      currentStreak: 0,
      lastPhotoDate: null,
      longestStreak: 0,
      totalPhotos: 0
    }
  }
}

/**
 * Save streak data
 */
function saveStreak(streak: PhotoStreak): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(streak))
}

/**
 * Calculate hours between two dates
 */
function getHoursDifference(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60)
}

/**
 * Check if streak is about to break (20-23h since last photo)
 */
export function isStreakAtRisk(): { atRisk: boolean; hoursRemaining: number } {
  const streak = getPhotoStreak()
  
  if (!streak.lastPhotoDate || streak.currentStreak === 0) {
    return { atRisk: false, hoursRemaining: 24 }
  }
  
  const hoursSinceLastPhoto = getHoursDifference(
    streak.lastPhotoDate,
    new Date().toISOString()
  )
  
  const hoursRemaining = STREAK_WINDOW_HOURS - hoursSinceLastPhoto
  
  // At risk if 4 hours or less remaining
  const atRisk = hoursRemaining <= 4 && hoursRemaining > 0
  
  return { atRisk, hoursRemaining }
}

/**
 * Update streak when a new photo is added
 * Returns: { streakIncreased, streakBroke, newStreak }
 */
export function updateStreakOnPhotoAdd(): {
  streakIncreased: boolean
  streakBroke: boolean
  newStreak: number
  isFirstPhoto: boolean
} {
  const streak = getPhotoStreak()
  const now = new Date().toISOString()
  
  console.log('[v0] Photo Streak - Before update:', streak)
  
  // First photo ever
  if (!streak.lastPhotoDate) {
    const newStreak: PhotoStreak = {
      currentStreak: 1,
      lastPhotoDate: now,
      longestStreak: 1,
      totalPhotos: 1
    }
    saveStreak(newStreak)
    console.log('[v0] Photo Streak - First photo:', newStreak)
    return {
      streakIncreased: true,
      streakBroke: false,
      newStreak: 1,
      isFirstPhoto: true
    }
  }
  
  const hoursSinceLastPhoto = getHoursDifference(streak.lastPhotoDate, now)
  console.log('[v0] Photo Streak - Hours since last photo:', hoursSinceLastPhoto)
  
  // Check if it's the same day
  const lastPhotoDay = new Date(streak.lastPhotoDate).toDateString()
  const todayDay = new Date(now).toDateString()
  const isSameDay = lastPhotoDay === todayDay
  
  console.log('[v0] Photo Streak - Same day?', isSameDay, lastPhotoDay, 'vs', todayDay)
  
  let newStreakValue = streak.currentStreak
  let streakIncreased = false
  let streakBroke = false
  
  // SAME DAY - Don't increase streak, just update total photos
  if (isSameDay) {
    console.log('[v0] Photo Streak - SAME DAY, no increase')
    newStreakValue = streak.currentStreak // Keep same streak
    streakIncreased = false
  }
  // More than 24h passed - streak broke
  else if (hoursSinceLastPhoto > STREAK_WINDOW_HOURS) {
    console.log('[v0] Photo Streak - BROKE (>24h)')
    newStreakValue = 1 // Start new streak
    streakBroke = true
    streakIncreased = true
  } 
  // Different day but within 24h - continue streak
  else {
    console.log('[v0] Photo Streak - NEW DAY, streak continues')
    newStreakValue = streak.currentStreak + 1
    streakIncreased = true
  }
  
  const newStreak: PhotoStreak = {
    currentStreak: newStreakValue,
    lastPhotoDate: now,
    longestStreak: Math.max(streak.longestStreak, newStreakValue),
    totalPhotos: streak.totalPhotos + 1
  }
  
  saveStreak(newStreak)
  console.log('[v0] Photo Streak - After update:', newStreak)
  
  return {
    streakIncreased,
    streakBroke,
    newStreak: newStreakValue,
    isFirstPhoto: false
  }
}

/**
 * Get streak status message
 */
export function getStreakStatus(): {
  message: string
  type: 'active' | 'risk' | 'none'
} {
  const streak = getPhotoStreak()
  
  if (streak.currentStreak === 0) {
    return {
      message: 'Start your streak today',
      type: 'none'
    }
  }
  
  const { atRisk, hoursRemaining } = isStreakAtRisk()
  
  if (atRisk) {
    return {
      message: `${Math.floor(hoursRemaining)}h left to keep your streak`,
      type: 'risk'
    }
  }
  
  return {
    message: `${streak.currentStreak}-day streak 🔥`,
    type: 'active'
  }
}

/**
 * Reset streak (for testing or manual reset)
 */
export function resetStreak(): void {
  const streak = getPhotoStreak()
  const newStreak: PhotoStreak = {
    currentStreak: 0,
    lastPhotoDate: null,
    longestStreak: streak.longestStreak, // Keep longest
    totalPhotos: streak.totalPhotos // Keep total
  }
  saveStreak(newStreak)
}
