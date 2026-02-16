/**
 * Centralized streak calculation utility
 * Handles consecutive day streak logic for all features
 */

export interface StreakEntry {
  date: string // YYYY-MM-DD format
}

/**
 * Calculate consecutive day streak
 * Returns current streak number
 * 
 * RULES:
 * - Streak continues if entry exists for today OR yesterday
 * - Streak resets if > 1 day gap
 * - Counts consecutive days backwards from most recent
 */
export function calculateDailyStreak(entries: StreakEntry[]): number {
  if (entries.length === 0) return 0

  // Sort entries by date descending (most recent first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check if there's an entry for today or yesterday to start the streak
  const latestEntryDate = new Date(sortedEntries[0].date)
  latestEntryDate.setHours(0, 0, 0, 0)
  
  const daysDiff = Math.floor((today.getTime() - latestEntryDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff > 1) {
    // Streak is broken if no entry today or yesterday
    return 0
  }

  // Count consecutive days
  let streak = 0
  let currentDate = new Date(latestEntryDate)
  const uniqueDates = new Set(sortedEntries.map(e => e.date))

  while (uniqueDates.has(currentDate.toISOString().split('T')[0])) {
    streak++
    currentDate.setDate(currentDate.getDate() - 1)
  }

  return streak
}
