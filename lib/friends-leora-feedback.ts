/**
 * Leora feedback for social interactions in Photo Dump
 */

const FRIEND_ADDED_MESSAGES = [
  "New friend added! Time to share moments together ✨",
  "Your circle just got bigger! 💛",
  "Another friend to share life with 🐆",
  "New connection made! How exciting 🌟",
  "Your friend list is growing! 💫",
  "Welcome to the pack! 🐾",
  "A new friendship begins ✨",
  "More friends, more memories to share! 💛"
]

const PHOTO_SHARED_MESSAGES = [
  "You shared a moment with friends 💛",
  "Your friends will love this! ✨",
  "Sharing is caring! 🐆",
  "A memory for your circle 📸",
  "Friends can now see this moment! 💫",
  "Shared with the pack! 🐾",
  "Your friends are lucky to see this ✨",
  "Beautiful moment shared! 💛"
]

const REACTION_RECEIVED_MESSAGES = [
  "Someone loved your photo! 💛",
  "A friend reacted to your moment ✨",
  "Your photo got some love! 🐆",
  "A friend appreciated this 💫",
  "Someone connected with your moment 💛",
  "Your photo sparked joy! ✨",
  "A friend noticed your photo 🐾",
  "Someone reacted to your memory! 💛"
]

const FRIEND_REQUEST_SENT_MESSAGES = [
  "Friend request sent! Fingers crossed 🤞",
  "Waiting for them to accept ✨",
  "Request sent! Hope they join you 💛",
  "Let's see if they want to connect 🐆",
  "Friend request on its way! 💫",
  "Reaching out to connect! ✨",
  "Request sent successfully! 🐾"
]

const FRIEND_REQUEST_ACCEPTED_MESSAGES = [
  "They said yes! New friend unlocked ✨",
  "Friend request accepted! 💛",
  "You're now connected! 🐆",
  "Friendship confirmed! Time to share 💫",
  "They accepted! Welcome to the circle ✨",
  "New friendship activated! 🐾",
  "Connection successful! 💛"
]

let lastFriendAddedIndex = -1
let lastPhotoSharedIndex = -1
let lastReactionReceivedIndex = -1
let lastRequestSentIndex = -1
let lastRequestAcceptedIndex = -1

function getRandomMessage(messages: string[], lastIndex: { value: number }): string {
  let index: number
  do {
    index = Math.floor(Math.random() * messages.length)
  } while (index === lastIndex.value && messages.length > 1)
  
  lastIndex.value = index
  return messages[index]
}

/**
 * Leora message when user adds a new friend
 */
export function getLeoraFriendAdded(friendUsername: string): string {
  const message = getRandomMessage(FRIEND_ADDED_MESSAGES, { value: lastFriendAddedIndex })
  lastFriendAddedIndex = FRIEND_ADDED_MESSAGES.indexOf(message)
  return message
}

/**
 * Leora message when user shares a photo with friends
 */
export function getLeoraPhotoShared(): string {
  const message = getRandomMessage(PHOTO_SHARED_MESSAGES, { value: lastPhotoSharedIndex })
  lastPhotoSharedIndex = PHOTO_SHARED_MESSAGES.indexOf(message)
  return message
}

/**
 * Leora message when user receives a reaction
 */
export function getLeoraReactionReceived(emoji: string): string {
  const message = getRandomMessage(REACTION_RECEIVED_MESSAGES, { value: lastReactionReceivedIndex })
  lastReactionReceivedIndex = REACTION_RECEIVED_MESSAGES.indexOf(message)
  return message
}

/**
 * Leora message when user sends a friend request
 */
export function getLeoraFriendRequestSent(): string {
  const message = getRandomMessage(FRIEND_REQUEST_SENT_MESSAGES, { value: lastRequestSentIndex })
  lastRequestSentIndex = FRIEND_REQUEST_SENT_MESSAGES.indexOf(message)
  return message
}

/**
 * Leora message when friend request is accepted
 */
export function getLeoraFriendRequestAccepted(): string {
  const message = getRandomMessage(FRIEND_REQUEST_ACCEPTED_MESSAGES, { value: lastRequestAcceptedIndex })
  lastRequestAcceptedIndex = FRIEND_REQUEST_ACCEPTED_MESSAGES.indexOf(message)
  return message
}
