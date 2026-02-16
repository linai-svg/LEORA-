export type SportType = 
  | 'gym'
  | 'running'
  | 'home_workout'
  | 'yoga'
  | 'swimming'
  | 'cycling'
  | 'walking'
  | 'pilates'
  | 'dance'
  | 'martial_arts'
  | 'team_sport'
  | 'other'

export type Intensity = 'low' | 'medium' | 'high'

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface SportSession {
  id: string
  userId: string
  sportType: SportType
  duration: number // minutes
  intensity: Intensity
  plannedDate: string // ISO date
  dayOfWeek: DayOfWeek
  isCompleted: boolean
  completedAt?: string // ISO datetime
  notes?: string
  feeling?: string // how they felt after
  createdAt: string
  updatedAt: string
}

export interface WeeklyPlan {
  id: string
  userId: string
  name: string
  isDefault: boolean
  sessions: PlannedSession[]
  createdAt: string
}

export interface PlannedSession {
  dayOfWeek: DayOfWeek
  sportType: SportType
  duration: number
  intensity: Intensity
}

export interface SportStats {
  weeklyTotal: number // minutes
  monthlyTotal: number // minutes
  weeklySessionsCompleted: number
  monthlySessionsCompleted: number
  currentStreak: number // days
  longestStreak: number // days
  lastSessionDate?: string
}

export const SPORT_TYPE_LABELS: Record<SportType, string> = {
  gym: 'Gym',
  running: 'Running',
  home_workout: 'Home Workout',
  yoga: 'Yoga',
  swimming: 'Swimming',
  cycling: 'Cycling',
  walking: 'Walking',
  pilates: 'Pilates',
  dance: 'Dance',
  martial_arts: 'Martial Arts',
  team_sport: 'Team Sport',
  other: 'Other'
}

export const INTENSITY_LABELS: Record<Intensity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
}

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
}
