export interface Friend {
  id: string
  userId: string
  username: string
  friendCode: string
  addedAt: string
  status: 'active' | 'blocked'
}

export interface FriendRequest {
  id: string
  fromUserId: string
  fromUsername: string
  toUserId: string
  toUsername: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
}

export interface PhotoReaction {
  id: string
  photoId: string
  userId: string
  username: string
  emoji: '❤️' | '😂' | '✨' | '👍' | '😮'
  timestamp: string
}

export interface SocialPhoto {
  id: string
  imageUrl: string
  caption: string
  timestamp: string
  expiresAt: string
  userId: string
  username: string
  sharingMode: 'private' | 'friends'
  reactions: PhotoReaction[]
  likes: string[]
}

export const REACTION_EMOJIS = ['❤️', '😂', '✨', '👍', '😮'] as const
export type ReactionEmoji = typeof REACTION_EMOJIS[number]
