/**
 * Leora Feedback for Photo Dump Streaks
 * Calm, positive, no pressure
 */

import type { PhotoStreak } from './photo-streak-service'

/**
 * Get random item from array (avoiding last used)
 */
let lastMessageIndex = -1
function getRandomMessage(messages: string[]): string {
  let index = Math.floor(Math.random() * messages.length)
  
  // Avoid repeating the same message consecutively
  if (messages.length > 1 && index === lastMessageIndex) {
    index = (index + 1) % messages.length
  }
  
  lastMessageIndex = index
  return messages[index]
}

/**
 * Leora feedback when streak increases
 */
export function getLeoraStreakIncrease(streak: number, isFirstPhoto: boolean): string {
  if (isFirstPhoto) {
    const messages = [
      "Your first photo! This is the start of something beautiful ✨",
      "Welcome to your photo journey! So excited to see what you'll capture 📸",
      "One photo down, and your story begins 💛",
      "Starting fresh! Can't wait to see your memories unfold 🌟",
      "First step taken! Your photo diary has begun 🎯"
    ]
    return getRandomMessage(messages)
  }
  
  if (streak === 1) {
    const messages = [
      "Back at it! Let's build that streak again 💪",
      "Starting fresh today - every day is a new opportunity 🌅",
      "Day one, let's go! 🚀",
      "New beginning, new memories ✨"
    ]
    return getRandomMessage(messages)
  }
  
  if (streak === 2) {
    const messages = [
      "Two days in a row! You're on a roll 🎉",
      "Another day captured! Keep it going 📸",
      "Day 2! The momentum is building ⚡",
      "Nice! Your streak is growing 🌱"
    ]
    return getRandomMessage(messages)
  }
  
  if (streak === 3) {
    const messages = [
      "Three days strong! This is becoming a habit 💫",
      "Day 3! You're creating something consistent ✨",
      "Three in a row - that's commitment! 🔥",
      "Third day! Your photo story is unfolding beautifully 📖"
    ]
    return getRandomMessage(messages)
  }
  
  if (streak === 7) {
    const messages = [
      "One week straight! This is incredible 🎊",
      "Seven days! You've built a real habit here 🌟",
      "A full week of memories! So proud of you 💛",
      "Week milestone! Your dedication shows 👏"
    ]
    return getRandomMessage(messages)
  }
  
  if (streak === 14) {
    const messages = [
      "Two weeks! Your consistency is inspiring 🌈",
      "14 days! You're creating a beautiful timeline 📸",
      "Fortnight achieved! This is a lifestyle now ✨",
      "Two solid weeks! Your commitment is amazing 🎯"
    ]
    return getRandomMessage(messages)
  }
  
  if (streak === 30) {
    const messages = [
      "ONE MONTH! This is absolutely incredible 🎉🎉",
      "30 days! You've documented a whole month of life 📅",
      "A full month streak! You're unstoppable 🔥",
      "Monthly milestone! Your dedication is remarkable 👑"
    ]
    return getRandomMessage(messages)
  }
  
  if (streak % 10 === 0) {
    const messages = [
      `${streak} days! Major milestone reached 🎯`,
      `Day ${streak}! Your streak is getting impressive 🌟`,
      `${streak}-day streak! You're crushing it 💪`,
      `Wow, ${streak} days! Keep this beautiful momentum 📸`
    ]
    return getRandomMessage(messages)
  }
  
  // Regular streak messages
  const messages = [
    "Another day captured ✨",
    `Day ${streak}! Your streak continues 🔥`,
    "Keep the momentum going! 💫",
    "Another memory saved 📸",
    "You're doing great! ⭐",
    `${streak} days and counting! 🎯`,
    "Love seeing you stay consistent 💛",
    "Another beautiful day documented ✨"
  ]
  
  return getRandomMessage(messages)
}

/**
 * Leora feedback when streak breaks
 */
export function getLeoraStreakBroke(previousStreak: number): string {
  const messages = [
    "It's okay! You can start again today 💛",
    "No worries - every day is a fresh start ✨",
    "Life happens! Ready to begin anew? 🌅",
    "That's totally fine - let's start a new streak 🚀",
    "All good! Your next streak starts now 💫",
    "No pressure - pick up where you feel ready 🌟",
    "Take your time! I'll be here when you're ready 📸"
  ]
  
  return getRandomMessage(messages)
}

/**
 * Leora reminder when streak is at risk (20-23h)
 */
export function getLeoraStreakReminder(hoursRemaining: number): string {
  const messages = [
    "Want to save something today? 📸",
    `${Math.floor(hoursRemaining)}h left - any moment worth capturing?`,
    "Thinking of adding to your collection today? ✨",
    "Got any photos you'd like to share or save? 💛",
    "Your streak is waiting for today's memory 🌟",
    "Capture something that made you smile today? 😊"
  ]
  
  return getRandomMessage(messages)
}

/**
 * Leora general encouragement (when viewing photos)
 */
export function getLeoraPhotoEncouragement(streak: PhotoStreak): string {
  if (streak.currentStreak === 0) {
    const messages = [
      "Ready to start capturing your days? 📸",
      "Your photo journey awaits ✨",
      "Every photo tells a story - want to start yours? 💛"
    ]
    return getRandomMessage(messages)
  }
  
  if (streak.currentStreak >= 7) {
    const messages = [
      "Your dedication to documenting life is beautiful 💫",
      `${streak.currentStreak} days of memories - incredible! 🌟`,
      "Love how consistent you've been with your photo diary 📸"
    ]
    return getRandomMessage(messages)
  }
  
  const messages = [
    "Your photo collection is growing beautifully 📸",
    `${streak.currentStreak}-day streak going strong! ✨`,
    "Keep capturing those moments 💛",
    "Every photo adds to your story 🌟"
  ]
  
  return getRandomMessage(messages)
}
