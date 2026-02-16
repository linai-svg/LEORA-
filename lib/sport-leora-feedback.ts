import { SportSession, Intensity } from './sport-types'

type FeedbackType = 
  | 'pre_session'
  | 'post_session_low'
  | 'post_session_medium'
  | 'post_session_high'
  | 'streak_start'
  | 'streak_milestone'
  | 'streak_lost'
  | 'missed_session'
  | 'first_session'
  | 'weekly_complete'

interface FeedbackContext {
  type: FeedbackType
  intensity?: Intensity
  streak?: number
  duration?: number
  consecutiveDays?: number
}

const FEEDBACK_MESSAGES: Record<FeedbackType, string[]> = {
  pre_session: [
    "You've got this! Time to move that body!",
    "Let's do this together! I believe in you!",
    "Ready to feel amazing? Let's go!",
    "Every session counts. You're already winning by showing up!",
    "This is your time. Make it count!",
    "Excited for your workout! Let's make it great!",
    "You're stronger than you think. Let's prove it!",
    "Today's the day to push a little further!",
    "Remember why you started. Now let's finish strong!",
    "Your future self will thank you for this!"
  ],
  
  post_session_low: [
    "Great job on taking it easy today! Rest is progress too!",
    "Perfect recovery session! Your body thanks you!",
    "Low intensity, high impact! Well done!",
    "Smart choice! Gentle movement is still movement!",
    "You showed up and that's what matters!",
    "Love this mindful approach to movement!",
    "Recovery days are just as important. Great work!",
    "Listening to your body is wisdom. Proud of you!",
    "Every session builds the foundation. Nice work!",
    "You moved today and that's a win!"
  ],
  
  post_session_medium: [
    "Solid workout! You found the perfect balance!",
    "That's how it's done! Great effort today!",
    "You're building real consistency here!",
    "Impressed by your commitment! Keep it up!",
    "This is the sweet spot! Excellent work!",
    "You're getting stronger every day!",
    "Perfect intensity level! Your body is loving this!",
    "This is how champions train! Well done!",
    "You're in the zone! Keep this momentum!",
    "Balanced and strong! That's my athlete!"
  ],
  
  post_session_high: [
    "WOW! You crushed that session! Incredible!",
    "That was intense! You're absolutely amazing!",
    "Look at you go! That was powerful!",
    "You just leveled up! Phenomenal effort!",
    "I'm in awe! You pushed through like a champ!",
    "BEAST MODE ACTIVATED! Outstanding work!",
    "You didn't just show up, you showed OUT!",
    "That's the spirit! You're unstoppable!",
    "Incredible power session! You're on fire!",
    "You just proved how strong you really are!"
  ],
  
  streak_start: [
    "Here we go! Day 1 of your new streak!",
    "Starting fresh! Let's build something great!",
    "New streak alert! I'm excited for this journey!",
    "Every streak starts with a single session. You did it!",
    "The beginning of something amazing!",
    "Let's see how far we can take this!",
    "Day 1 complete! Tomorrow is calling!",
    "You've planted the seed. Let's watch it grow!",
    "This is the start of your winning streak!",
    "First step taken! Ready for day 2?"
  ],
  
  streak_milestone: [
    "{{days}} days strong! You're on a roll!",
    "{{days}}-day streak! This is incredible!",
    "Look at you! {{days}} days of pure dedication!",
    "{{days}} days in a row! You're unstoppable!",
    "Consistency is key and you've got {{days}} days to prove it!",
    "{{days}}-day streak! Your future self is so proud!",
    "{{days}} days! You're building an empire of strength!",
    "Amazing! {{days}} consecutive days! Keep going!",
    "{{days}} days of showing up for yourself!",
    "This {{days}}-day streak is YOUR achievement!"
  ],
  
  streak_lost: [
    "New day, fresh start! Let's begin again!",
    "A break doesn't erase your progress. Let's rebuild!",
    "Every champion has off days. Ready to bounce back?",
    "The journey continues! One day doesn't define you!",
    "Rest was needed. Now let's get back stronger!",
    "You've done this before, you'll do it again!",
    "Life happens. What matters is getting back on track!",
    "This is just a pause, not a stop. Let's go!",
    "Your body needed rest. Now it's ready to move!",
    "Streak reset, but your strength remains!"
  ],
  
  missed_session: [
    "It's okay! Tomorrow is a new opportunity!",
    "No worries! One missed session doesn't break you!",
    "Life got busy. Let's plan better for next time!",
    "You've got this! Get back when you're ready!",
    "Missing one doesn't mean missing out. Come back strong!",
    "It happens to everyone! What matters is returning!",
    "Take the rest, then let's get back to it!",
    "One skip won't stop your progress. Keep going!",
    "Tomorrow's a new chance to move!",
    "Rest today, conquer tomorrow!"
  ],
  
  first_session: [
    "First session complete! This is the beginning!",
    "You just took the most important step!",
    "Welcome to your fitness journey! So proud!",
    "The hardest part is starting. You did it!",
    "First of many! You're already a winner!",
    "What a way to start! Excited for your journey!",
    "You showed up! That's 90% of the battle!",
    "First session done! The momentum starts now!",
    "This is where champions are born. Welcome!",
    "Your transformation begins today!"
  ],
  
  weekly_complete: [
    "Week complete! You hit all your goals!",
    "Perfect week! Every session completed!",
    "What a week! You showed up every time!",
    "100% completion! You're absolutely crushing it!",
    "Full week done! This is consistency at its best!",
    "Week conquered! Your dedication is inspiring!",
    "All sessions complete! You're a commitment machine!",
    "That's a wrap! Perfect week in the books!",
    "Every. Single. Session. Complete! Amazing!",
    "Week done! You're building something special!"
  ]
}

// Track last used messages to avoid repetition
let lastMessages: Map<FeedbackType, string> = new Map()

export function generateSportFeedback(context: FeedbackContext): string {
  const messages = FEEDBACK_MESSAGES[context.type]
  
  // Filter out last used message
  const lastUsed = lastMessages.get(context.type)
  const available = messages.filter(m => m !== lastUsed)
  
  // Pick random message
  const selected = available[Math.floor(Math.random() * available.length)]
  
  // Store for next time
  lastMessages.set(context.type, selected)
  
  // Replace placeholders
  let message = selected
  if (context.streak) {
    message = message.replace(/{{days}}/g, context.streak.toString())
  }
  
  return message
}

export function getSessionCompletionFeedback(
  session: SportSession,
  currentStreak: number,
  isFirstSession: boolean,
  weeklyComplete: boolean
): string {
  // First session ever
  if (isFirstSession) {
    return generateSportFeedback({ type: 'first_session' })
  }
  
  // Weekly completion
  if (weeklyComplete) {
    return generateSportFeedback({ type: 'weekly_complete' })
  }
  
  // Streak milestones
  if (currentStreak > 0 && currentStreak % 7 === 0) {
    return generateSportFeedback({ 
      type: 'streak_milestone', 
      streak: currentStreak 
    })
  }
  
  if (currentStreak === 1) {
    return generateSportFeedback({ type: 'streak_start' })
  }
  
  // Based on intensity
  if (session.intensity === 'high') {
    return generateSportFeedback({ 
      type: 'post_session_high',
      intensity: session.intensity,
      duration: session.duration
    })
  }
  
  if (session.intensity === 'medium') {
    return generateSportFeedback({ 
      type: 'post_session_medium',
      intensity: session.intensity,
      duration: session.duration
    })
  }
  
  return generateSportFeedback({ 
    type: 'post_session_low',
    intensity: session.intensity,
    duration: session.duration
  })
}

export function getPreSessionMotivation(): string {
  return generateSportFeedback({ type: 'pre_session' })
}

export function getStreakLostFeedback(): string {
  return generateSportFeedback({ type: 'streak_lost' })
}

export function getMissedSessionFeedback(): string {
  return generateSportFeedback({ type: 'missed_session' })
}
