// User types
export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  createdAt: string
  subscriptionStatus: 'free' | 'premium' | 'trial'
  subscriptionExpiry?: string
}

// Agenda types
export interface AgendaEvent {
  id: string
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  color: string
  completed: boolean
  userId: string
}

// Study types
export interface StudySession {
  id: string
  subject: string
  topic: string
  duration: number
  date: string
  notes?: string
  userId: string
}

export interface StudyGoal {
  id: string
  subject: string
  hoursPerWeek: number
  currentHours: number
  userId: string
}

// Handwriting types for Study section
export interface Point {
  x: number
  y: number
  pressure: number
  timestamp: number
}

export interface Stroke {
  id: string
  points: Point[]
  color: string
  width: number
  opacity: number
  tool: 'pen' | 'highlighter' | 'eraser'
}

export interface StudyPage {
  id: string
  userId: string
  subject: string
  topic: string
  pageNumber: number
  strokes: Stroke[]
  canvasWidth: number
  canvasHeight: number
  thumbnail: string
  recognizedText?: string
  manualText?: string
  textConfidence?: number
  createdAt: string
  updatedAt: string
  lastAccessedAt: string
  tags: string[]
}

// Notes types
export interface Note {
  id: string
  title: string
  content: string
  color: string
  tags: string[]
  createdAt: string
  updatedAt: string
  userId: string
}

// Goals types
export interface Goal {
  id: string
  userId: string
  title: string
  description: string
  type: 'monthly' | 'yearly'
  category: 'study' | 'health' | 'personal' | 'other'
  priority: 'low' | 'medium' | 'high'
  deadline: string
  targetMonth?: number
  targetYear: number
  completed: boolean
  completedAt?: string
  archived: boolean
  createdAt: string
  updatedAt: string
}

// Mood types
export interface MoodEntry {
  id: string
  mood: 'amazing' | 'good' | 'okay' | 'bad' | 'awful'
  note?: string
  date: string
  userId: string
}

// Sport types
export interface SportActivity {
  id: string
  type: string
  duration: number
  intensity: 'light' | 'moderate' | 'intense'
  calories?: number
  date: string
  notes?: string
  userId: string
}

// Outfit types
export interface Outfit {
  id: string
  name: string
  imageUrl: string
  category: 'casual' | 'formal' | 'sport' | 'party' | 'work'
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'all'
  tags: string[]
  favorite: boolean
  createdAt: string
  userId: string
}

// Photo dump types
export interface PhotoDump {
  id: string
  imageUrl: string
  caption?: string
  timestamp: string
  expiresAt: string
  userId: string
  likes: string[]
  comments: PhotoComment[]
}

export interface PhotoComment {
  id: string
  userId: string
  userName: string
  text: string
  timestamp: string
}

export interface StreakData {
  userId: string
  currentStreak: number
  longestStreak: number
  lastPostDate: string
}

// Dashboard types
export interface DashboardStats {
  todayEvents: number
  weeklyGoals: number
  studyHours: number
  currentStreak: number
  moodThisWeek: MoodEntry[]
  upcomingEvents: AgendaEvent[]
}
