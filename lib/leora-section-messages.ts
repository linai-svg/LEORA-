/**
 * Leora Section-Specific Messages
 * Short, reactive expressions for each section
 * NOT a chatbot - just presence and encouragement
 */

export function getLeoraHomeMessage(): string {
  const messages = [
    "Let's stay consistent today 💪",
    "Ready for a productive day? 🌟",
    "Your progress is looking good!",
    "Small steps, big results ✨",
    "Keep up the momentum!",
    "Another day, another chance 🐆",
    "You've got this!",
    "Let's make today count 💛"
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

export function getLeoraStudyMessage(): string {
  const messages = [
    "Write it. I'll turn it into text ✍️",
    "Your notes, digitized 📝",
    "Handwriting made easy ✨",
    "Draw, write, learn 🐆",
    "I'll convert your handwriting!",
    "Ready to study? Let's go!",
    "Write naturally, I'll handle the rest 💛"
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

export function getLeoraSportMessage(weekCompleted: boolean): string {
  if (weekCompleted) {
    const completed = [
      "Week completed! Strong work 💪",
      "You crushed this week! 🔥",
      "Another week in the books ✓",
      "Consistency is your superpower!",
      "Week done! Keep it going 🐆"
    ]
    return completed[Math.floor(Math.random() * completed.length)]
  }
  
  const pending = [
    "One workout = one strong week 🏃",
    "Let's get moving today!",
    "Time to work out? 💪",
    "Your body will thank you 🐆",
    "Small workout, big impact ✨",
    "Ready to train?"
  ]
  return pending[Math.floor(Math.random() * pending.length)]
}

export function getLeoraPhotoDumpMessage(hasPostedToday: boolean): string {
  if (hasPostedToday) {
    const posted = [
      "Photo captured for today! 📸",
      "Streak maintained ✓",
      "Nice! Daily photo done 🔥",
      "Another day saved 💛",
      "Today's moment captured! 🐆"
    ]
    return posted[Math.floor(Math.random() * posted.length)]
  }
  
  const pending = [
    "Post today to keep your streak 🔥",
    "Capture a moment today 📸",
    "Don't break the streak!",
    "One photo a day 💛",
    "Save today's moment 🐆"
  ]
  return pending[Math.floor(Math.random() * pending.length)]
}

export function getLeoraOutfitsMessage(): string {
  const messages = [
    "Let me style you today ✨",
    "Ready for a fresh outfit?",
    "What should you wear? 🐆",
    "Your wardrobe, my suggestions 💛",
    "Let's find the perfect look!",
    "Style made simple ✨"
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

export function getLeoraGoalsMessage(): string {
  const messages = [
    "Small steps lead to big goals 🎯",
    "Progress over perfection!",
    "Keep tracking, keep growing ✨",
    "Your goals matter 💛",
    "One step closer every day 🐆",
    "Consistency builds success!",
    "You're doing great! Keep going 💪"
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

export function getLeoraNotesMessage(): string {
  const messages = [
    "Capture your thoughts here 📝",
    "Quick notes, lasting memories ✨",
    "Your ideas matter 💡",
    "Write it down, remember it better 🐆",
    "Notes keep you organized 💛",
    "Clear mind, clear notes!",
    "Every thought counts ✍️"
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

export function getLeoraAgendaMessage(): string {
  const messages = [
    "Plan your week, own your time 📅",
    "Organization is power ✨",
    "One week at a time 🐆",
    "Stay on track, stay focused 💛",
    "Your week, your way!",
    "Small tasks, big progress 💪",
    "Let's plan this week together!"
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

export function getLeoraMoodMessage(): string {
  const messages = [
    "How are you feeling today? 💛",
    "Your emotions matter ✨",
    "Track your wellbeing 🐆",
    "It's okay to feel everything!",
    "Mood check time 💭",
    "Listen to yourself today 🌟",
    "Every feeling is valid 💚"
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}
