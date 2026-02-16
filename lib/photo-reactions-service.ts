import type { PhotoReaction, ReactionEmoji } from './friends-types'

const REACTIONS_KEY = 'leora_photo_reactions'

/**
 * Get all reactions for a photo
 */
export function getPhotoReactions(photoId: string): PhotoReaction[] {
  try {
    const reactions = JSON.parse(localStorage.getItem(REACTIONS_KEY) || '[]')
    return reactions.filter((r: PhotoReaction) => r.photoId === photoId)
  } catch {
    return []
  }
}

/**
 * Add a reaction to a photo
 */
export function addReaction(
  photoId: string,
  userId: string,
  username: string,
  emoji: ReactionEmoji
): { success: boolean; message: string; reaction?: PhotoReaction } {
  try {
    const reactions = JSON.parse(localStorage.getItem(REACTIONS_KEY) || '[]')
    
    // Check if user already reacted to this photo
    const existingIndex = reactions.findIndex(
      (r: PhotoReaction) => r.photoId === photoId && r.userId === userId
    )
    
    // If user already reacted with same emoji, remove it (toggle)
    if (existingIndex !== -1 && reactions[existingIndex].emoji === emoji) {
      reactions.splice(existingIndex, 1)
      localStorage.setItem(REACTIONS_KEY, JSON.stringify(reactions))
      return { success: true, message: 'Reaction removed' }
    }
    
    // If user already reacted with different emoji, update it
    if (existingIndex !== -1) {
      reactions[existingIndex].emoji = emoji
      reactions[existingIndex].timestamp = new Date().toISOString()
      localStorage.setItem(REACTIONS_KEY, JSON.stringify(reactions))
      return { 
        success: true, 
        message: 'Reaction updated',
        reaction: reactions[existingIndex]
      }
    }
    
    // Add new reaction
    const newReaction: PhotoReaction = {
      id: `reaction_${Date.now()}`,
      photoId,
      userId,
      username,
      emoji,
      timestamp: new Date().toISOString()
    }
    
    reactions.push(newReaction)
    localStorage.setItem(REACTIONS_KEY, JSON.stringify(reactions))
    
    return { 
      success: true, 
      message: 'Reaction added',
      reaction: newReaction
    }
  } catch (error) {
    return { success: false, message: 'Failed to add reaction' }
  }
}

/**
 * Remove a reaction
 */
export function removeReaction(photoId: string, userId: string): { success: boolean; message: string } {
  try {
    const reactions = JSON.parse(localStorage.getItem(REACTIONS_KEY) || '[]')
    const updated = reactions.filter(
      (r: PhotoReaction) => !(r.photoId === photoId && r.userId === userId)
    )
    
    localStorage.setItem(REACTIONS_KEY, JSON.stringify(updated))
    
    return { success: true, message: 'Reaction removed' }
  } catch (error) {
    return { success: false, message: 'Failed to remove reaction' }
  }
}

/**
 * Get user's reaction to a photo
 */
export function getUserReaction(photoId: string, userId: string): PhotoReaction | null {
  try {
    const reactions = JSON.parse(localStorage.getItem(REACTIONS_KEY) || '[]')
    return reactions.find(
      (r: PhotoReaction) => r.photoId === photoId && r.userId === userId
    ) || null
  } catch {
    return null
  }
}

/**
 * Group reactions by emoji for display
 */
export function groupReactionsByEmoji(reactions: PhotoReaction[]): Record<ReactionEmoji, PhotoReaction[]> {
  const grouped: Record<string, PhotoReaction[]> = {
    '❤️': [],
    '😂': [],
    '✨': [],
    '👍': [],
    '😮': []
  }
  
  for (const reaction of reactions) {
    if (grouped[reaction.emoji]) {
      grouped[reaction.emoji].push(reaction)
    }
  }
  
  return grouped as Record<ReactionEmoji, PhotoReaction[]>
}
