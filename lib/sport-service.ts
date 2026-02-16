import { SportSession, SportStats, WeeklyPlan, DayOfWeek } from './sport-types'

const SESSIONS_KEY = 'leora_sport_sessions'
const PLANS_KEY = 'leora_sport_plans'
const STREAK_KEY = 'leora_sport_streak'

class SportService {
  // ===== SESSION MANAGEMENT =====
  
  getAllSessions(): SportSession[] {
    const data = localStorage.getItem(SESSIONS_KEY)
    return data ? JSON.parse(data) : []
  }
  
  getSessionById(id: string): SportSession | undefined {
    return this.getAllSessions().find(s => s.id === id)
  }
  
  createSession(session: Omit<SportSession, 'id' | 'createdAt' | 'updatedAt'>): SportSession {
    const sessions = this.getAllSessions()
    const newSession: SportSession = {
      ...session,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    sessions.push(newSession)
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
    return newSession
  }
  
  updateSession(id: string, updates: Partial<SportSession>): SportSession | null {
    const sessions = this.getAllSessions()
    const index = sessions.findIndex(s => s.id === id)
    if (index === -1) return null
    
    sessions[index] = {
      ...sessions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
    return sessions[index]
  }
  
  completeSession(id: string, notes?: string, feeling?: string): SportSession | null {
    return this.updateSession(id, {
      isCompleted: true,
      completedAt: new Date().toISOString(),
      notes,
      feeling
    })
  }
  
  deleteSession(id: string): boolean {
    const sessions = this.getAllSessions()
    const filtered = sessions.filter(s => s.id !== id)
    if (filtered.length === sessions.length) return false
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered))
    return true
  }
  
  // ===== WEEKLY PLAN MANAGEMENT =====
  
  getAllPlans(): WeeklyPlan[] {
    const data = localStorage.getItem(PLANS_KEY)
    return data ? JSON.parse(data) : []
  }
  
  getDefaultPlan(): WeeklyPlan | undefined {
    return this.getAllPlans().find(p => p.isDefault)
  }
  
  createPlan(plan: Omit<WeeklyPlan, 'id' | 'createdAt'>): WeeklyPlan {
    const plans = this.getAllPlans()
    const newPlan: WeeklyPlan = {
      ...plan,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    }
    plans.push(newPlan)
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans))
    return newPlan
  }
  
  setDefaultPlan(id: string): void {
    const plans = this.getAllPlans()
    const updated = plans.map(p => ({
      ...p,
      isDefault: p.id === id
    }))
    localStorage.setItem(PLANS_KEY, JSON.stringify(updated))
  }
  
  // ===== STATISTICS =====
  
  getStats(userId: string): SportStats {
    const sessions = this.getAllSessions().filter(s => s.userId === userId && s.isCompleted)
    const now = new Date()
    
    // Week calculation
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1) // Monday
    weekStart.setHours(0, 0, 0, 0)
    
    const weekSessions = sessions.filter(s => {
      const date = new Date(s.completedAt!)
      return date >= weekStart
    })
    
    // Month calculation
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthSessions = sessions.filter(s => {
      const date = new Date(s.completedAt!)
      return date >= monthStart
    })
    
    // Streak calculation
    const streak = this.calculateStreak(sessions)
    
    return {
      weeklyTotal: weekSessions.reduce((sum, s) => sum + s.duration, 0),
      monthlyTotal: monthSessions.reduce((sum, s) => sum + s.duration, 0),
      weeklySessionsCompleted: weekSessions.length,
      monthlySessionsCompleted: monthSessions.length,
      currentStreak: streak.current,
      longestStreak: streak.longest,
      lastSessionDate: sessions.length > 0 
        ? sessions.sort((a, b) => 
            new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
          )[0].completedAt
        : undefined
    }
  }
  
  private calculateStreak(sessions: SportSession[]): { current: number; longest: number } {
    if (sessions.length === 0) return { current: 0, longest: 0 }
    
    // Sort by completion date descending
    const sorted = sessions
      .filter(s => s.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    
    // WEEKLY STREAK LOGIC (not daily)
    // A week counts if at least one workout was completed
    const today = new Date()
    
    // Get week number for a date (ISO week)
    const getWeekNumber = (date: Date): string => {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() + 4 - (d.getDay() || 7)) // Thursday of the week
      const yearStart = new Date(d.getFullYear(), 0, 1)
      const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
      return `${d.getFullYear()}-W${weekNo}`
    }
    
    // Group sessions by week
    const weeksWithWorkouts = new Set<string>()
    sorted.forEach(session => {
      const weekKey = getWeekNumber(new Date(session.completedAt!))
      weeksWithWorkouts.add(weekKey)
    })
    
    // Calculate current streak (consecutive weeks with workouts)
    let currentStreak = 0
    const currentWeek = getWeekNumber(today)
    let checkWeek = currentWeek
    
    // Parse week string to get year and week number
    const parseWeek = (weekStr: string): { year: number; week: number } => {
      const [year, week] = weekStr.split('-W')
      return { year: parseInt(year), week: parseInt(week) }
    }
    
    // Get previous week
    const getPreviousWeek = (weekStr: string): string => {
      const { year, week } = parseWeek(weekStr)
      if (week === 1) {
        return `${year - 1}-W52` // Approximate, good enough
      }
      return `${year}-W${week - 1}`
    }
    
    // Count consecutive weeks
    while (weeksWithWorkouts.has(checkWeek)) {
      currentStreak++
      checkWeek = getPreviousWeek(checkWeek)
    }
    
    // Calculate longest streak
    let current = 0
    let longestStreak = 0
    let lastDate: Date | null = null
    
    for (const session of sorted.reverse()) {
      const sessionDate = new Date(session.completedAt!)
      sessionDate.setHours(0, 0, 0, 0)
      
      if (!lastDate) {
        current = 1
        lastDate = sessionDate
      } else {
        const diffDays = Math.floor((sessionDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays <= 1) {
          if (diffDays === 1) {
            current++
          }
          lastDate = sessionDate
        } else {
          longestStreak = Math.max(longestStreak, current)
          current = 1
          lastDate = sessionDate
        }
      }
    }
    longestStreak = Math.max(longestStreak, current)
    
    return { current: currentStreak, longest: longestStreak }
  }
  
  // ===== HELPER METHODS =====
  
  getSessionsForWeek(startDate: Date, userId: string): SportSession[] {
    const sessions = this.getAllSessions().filter(s => s.userId === userId)
    const weekStart = new Date(startDate)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    
    return sessions.filter(s => {
      const date = new Date(s.plannedDate)
      return date >= weekStart && date < weekEnd
    })
  }
  
  getDayOfWeekFromDate(date: Date): DayOfWeek {
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[date.getDay()]
  }
}

export const sportService = new SportService()
