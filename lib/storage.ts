import type { User, AgendaEvent, Note, Goal, MoodEntry, SportActivity, Outfit, StudySession } from '@/types'

// Storage keys
const KEYS = {
  USER: 'leora_user',
  EVENTS: 'leora_events',
  NOTES: 'leora_notes',
  GOALS: 'leora_goals',
  MOOD: 'leora_mood',
  SPORT: 'leora_sport',
  OUTFITS: 'leora_outfits',
  STUDY: 'leora_study',
  SUBSCRIPTION: 'leora_subscription',
} as const

// Generic storage functions
export function getFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error)
    return null
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error)
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error)
  }
}

// User storage
export const userStorage = {
  get: () => getFromStorage<User>(KEYS.USER),
  set: (user: User) => saveToStorage(KEYS.USER, user),
  remove: () => removeFromStorage(KEYS.USER),
}

// Events storage
export const eventsStorage = {
  getAll: () => getFromStorage<AgendaEvent[]>(KEYS.EVENTS) || [],
  set: (events: AgendaEvent[]) => saveToStorage(KEYS.EVENTS, events),
  add: (event: AgendaEvent) => {
    const events = eventsStorage.getAll()
    events.push(event)
    eventsStorage.set(events)
  },
  update: (id: string, updates: Partial<AgendaEvent>) => {
    const events = eventsStorage.getAll()
    const index = events.findIndex(e => e.id === id)
    if (index !== -1) {
      events[index] = { ...events[index], ...updates }
      eventsStorage.set(events)
    }
  },
  delete: (id: string) => {
    const events = eventsStorage.getAll()
    eventsStorage.set(events.filter(e => e.id !== id))
  },
}

// Notes storage
export const notesStorage = {
  getAll: () => getFromStorage<Note[]>(KEYS.NOTES) || [],
  set: (notes: Note[]) => saveToStorage(KEYS.NOTES, notes),
  add: (note: Note) => {
    const notes = notesStorage.getAll()
    notes.push(note)
    notesStorage.set(notes)
  },
  update: (id: string, updates: Partial<Note>) => {
    const notes = notesStorage.getAll()
    const index = notes.findIndex(n => n.id === id)
    if (index !== -1) {
      notes[index] = { ...notes[index], ...updates }
      notesStorage.set(notes)
    }
  },
  delete: (id: string) => {
    const notes = notesStorage.getAll()
    notesStorage.set(notes.filter(n => n.id !== id))
  },
}

// Goals storage
export const goalsStorage = {
  getAll: () => getFromStorage<Goal[]>(KEYS.GOALS) || [],
  set: (goals: Goal[]) => saveToStorage(KEYS.GOALS, goals),
  add: (goal: Goal) => {
    const goals = goalsStorage.getAll()
    goals.push(goal)
    goalsStorage.set(goals)
  },
  update: (id: string, updates: Partial<Goal>) => {
    const goals = goalsStorage.getAll()
    const index = goals.findIndex(g => g.id === id)
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updates }
      goalsStorage.set(goals)
    }
  },
  delete: (id: string) => {
    const goals = goalsStorage.getAll()
    goalsStorage.set(goals.filter(g => g.id !== id))
  },
}

// Mood storage
export const moodStorage = {
  getAll: () => getFromStorage<MoodEntry[]>(KEYS.MOOD) || [],
  set: (moods: MoodEntry[]) => saveToStorage(KEYS.MOOD, moods),
  add: (mood: MoodEntry) => {
    const moods = moodStorage.getAll()
    moods.push(mood)
    moodStorage.set(moods)
  },
}

// Sport storage
export const sportStorage = {
  getAll: () => getFromStorage<SportActivity[]>(KEYS.SPORT) || [],
  set: (activities: SportActivity[]) => saveToStorage(KEYS.SPORT, activities),
  add: (activity: SportActivity) => {
    const activities = sportStorage.getAll()
    activities.push(activity)
    sportStorage.set(activities)
  },
  delete: (id: string) => {
    const activities = sportStorage.getAll()
    sportStorage.set(activities.filter(a => a.id !== id))
  },
}

// Outfits storage
export const outfitsStorage = {
  getAll: () => getFromStorage<Outfit[]>(KEYS.OUTFITS) || [],
  set: (outfits: Outfit[]) => saveToStorage(KEYS.OUTFITS, outfits),
  add: (outfit: Outfit) => {
    const outfits = outfitsStorage.getAll()
    outfits.push(outfit)
    outfitsStorage.set(outfits)
  },
  update: (id: string, updates: Partial<Outfit>) => {
    const outfits = outfitsStorage.getAll()
    const index = outfits.findIndex(o => o.id === id)
    if (index !== -1) {
      outfits[index] = { ...outfits[index], ...updates }
      outfitsStorage.set(outfits)
    }
  },
  delete: (id: string) => {
    const outfits = outfitsStorage.getAll()
    outfitsStorage.set(outfits.filter(o => o.id !== id))
  },
}

// Study storage
export const studyStorage = {
  getAll: () => getFromStorage<StudySession[]>(KEYS.STUDY) || [],
  set: (sessions: StudySession[]) => saveToStorage(KEYS.STUDY, sessions),
  add: (session: StudySession) => {
    const sessions = studyStorage.getAll()
    sessions.push(session)
    studyStorage.set(sessions)
  },
  delete: (id: string) => {
    const sessions = studyStorage.getAll()
    studyStorage.set(sessions.filter(s => s.id !== id))
  },
}
