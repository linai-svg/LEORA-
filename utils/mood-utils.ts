interface MoodEntry {
  id: string
  mood: "great" | "good" | "okay" | "bad" | "terrible"
  note: string
  date: string
  createdAt: string
}

/**
 * Calculate the current streak of consecutive days with mood entries
 */
export function calculateStreak(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0

  // Sort entries by date descending (most recent first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  let streak = 0
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
  let currentDate = new Date(latestEntryDate)
  const uniqueDates = new Set(sortedEntries.map(e => e.date))

  while (uniqueDates.has(currentDate.toISOString().split('T')[0])) {
    streak++
    currentDate.setDate(currentDate.getDate() - 1)
  }

  return streak
}

/**
 * Get an array of the last 7 days as date strings (YYYY-MM-DD)
 */
export function getLast7Days(): string[] {
  const days: string[] = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    date.setHours(0, 0, 0, 0)
    days.push(date.toISOString().split('T')[0])
  }
  
  return days
}
