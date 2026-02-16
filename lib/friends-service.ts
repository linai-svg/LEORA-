import type { Friend, FriendRequest } from './friends-types'

const FRIENDS_KEY = 'leora_friends'
const FRIEND_REQUESTS_KEY = 'leora_friend_requests'

/**
 * Generate a unique friend code for a user
 */
export function generateFriendCode(userId: string): string {
  // Generate a 6-character alphanumeric code
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return `${code}-${userId.slice(0, 4).toUpperCase()}`
}

/**
 * Get all friends for a user
 */
export function getFriends(userId: string): Friend[] {
  try {
    const friends = JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]')
    return friends.filter((f: Friend) => 
      f.userId === userId && f.status === 'active'
    )
  } catch {
    return []
  }
}

/**
 * Get a friend by friend code
 */
export function findUserByFriendCode(friendCode: string): Friend | null {
  try {
    const friends = JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]')
    return friends.find((f: Friend) => f.friendCode === friendCode) || null
  } catch {
    return null
  }
}

/**
 * Send a friend request
 */
export function sendFriendRequest(
  fromUserId: string,
  fromUsername: string,
  toFriendCode: string
): { success: boolean; message: string; request?: FriendRequest } {
  try {
    console.log('[v0] Friend Request - Searching for friend code:', toFriendCode)
    
    // Find target user by friend code - search ALL user entries
    const allUsers = JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]')
    console.log('[v0] Friend Request - All users:', allUsers.length)
    
    // Find user entry that matches the friend code
    const targetUser = allUsers.find((f: Friend) => 
      f.friendCode === toFriendCode && f.userId === f.userId // User's own entry
    )
    
    console.log('[v0] Friend Request - Target user found:', targetUser)
    
    if (!targetUser) {
      console.log('[v0] Friend Request - Friend code not found')
      return { success: false, message: 'Friend code not found. Make sure the code is correct.' }
    }
    
    if (targetUser.userId === fromUserId) {
      console.log('[v0] Friend Request - Cannot add self')
      return { success: false, message: 'You cannot add yourself as a friend' }
    }
    
    // Check if already friends
    const friends = getFriends(fromUserId)
    const alreadyFriend = friends.some(f => {
      // Extract userId from friendCode or check username
      return f.username === targetUser.username || f.friendCode.includes(targetUser.userId.slice(0, 4))
    })
    
    if (alreadyFriend) {
      console.log('[v0] Friend Request - Already friends')
      return { success: false, message: 'You are already friends with this user' }
    }
    
    // Check if request already exists
    const requests = JSON.parse(localStorage.getItem(FRIEND_REQUESTS_KEY) || '[]')
    const existingRequest = requests.find((r: FriendRequest) => 
      ((r.fromUserId === fromUserId && r.toUserId === targetUser.userId) ||
       (r.fromUserId === targetUser.userId && r.toUserId === fromUserId)) &&
      r.status === 'pending'
    )
    
    if (existingRequest) {
      console.log('[v0] Friend Request - Already exists')
      return { success: false, message: 'Friend request already pending' }
    }
    
    // Create friend request
    const newRequest: FriendRequest = {
      id: `req_${Date.now()}`,
      fromUserId,
      fromUsername,
      toUserId: targetUser.userId,
      toUsername: targetUser.username,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    
    console.log('[v0] Friend Request - Creating request:', newRequest)
    
    requests.push(newRequest)
    localStorage.setItem(FRIEND_REQUESTS_KEY, JSON.stringify(requests))
    
    console.log('[v0] Friend Request - Request saved successfully')
    
    return { 
      success: true, 
      message: `Friend request sent to ${targetUser.username}`,
      request: newRequest
    }
  } catch (error) {
    console.error('[v0] Friend Request - Error:', error)
    return { success: false, message: 'Failed to send friend request' }
  }
}

/**
 * Get pending friend requests for a user
 */
export function getPendingRequests(userId: string): FriendRequest[] {
  try {
    const requests = JSON.parse(localStorage.getItem(FRIEND_REQUESTS_KEY) || '[]')
    return requests.filter((r: FriendRequest) => 
      r.toUserId === userId && r.status === 'pending'
    )
  } catch {
    return []
  }
}

/**
 * Accept a friend request
 */
export function acceptFriendRequest(requestId: string, userId: string): { success: boolean; message: string } {
  try {
    console.log('[v0] Accept Request - Request ID:', requestId, 'User:', userId)
    
    const requests = JSON.parse(localStorage.getItem(FRIEND_REQUESTS_KEY) || '[]')
    const requestIndex = requests.findIndex((r: FriendRequest) => r.id === requestId)
    
    if (requestIndex === -1) {
      console.log('[v0] Accept Request - Request not found')
      return { success: false, message: 'Request not found' }
    }
    
    const request = requests[requestIndex]
    
    if (request.toUserId !== userId) {
      console.log('[v0] Accept Request - Unauthorized')
      return { success: false, message: 'Unauthorized' }
    }
    
    // Update request status
    requests[requestIndex].status = 'accepted'
    localStorage.setItem(FRIEND_REQUESTS_KEY, JSON.stringify(requests))
    
    // Add both users as friends to each other
    const allUsers = JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]')
    
    // Find friend codes for both users
    const user1Entry = allUsers.find((u: Friend) => u.userId === request.toUserId)
    const user2Entry = allUsers.find((u: Friend) => u.userId === request.fromUserId)
    
    console.log('[v0] Accept Request - User 1:', user1Entry, 'User 2:', user2Entry)
    
    // User 1 (receiver) adds User 2 (sender) as friend
    allUsers.push({
      id: `friend_${Date.now()}_1`,
      userId: request.toUserId,
      username: request.fromUsername, // The friend's username
      friendCode: user2Entry?.friendCode || generateFriendCode(request.fromUserId),
      addedAt: new Date().toISOString(),
      status: 'active'
    })
    
    // User 2 (sender) adds User 1 (receiver) as friend
    allUsers.push({
      id: `friend_${Date.now()}_2`,
      userId: request.fromUserId,
      username: request.toUsername, // The friend's username
      friendCode: user1Entry?.friendCode || generateFriendCode(request.toUserId),
      addedAt: new Date().toISOString(),
      status: 'active'
    })
    
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(allUsers))
    
    console.log('[v0] Accept Request - Friendship created successfully')
    
    return { success: true, message: `You are now friends with ${request.fromUsername}` }
  } catch (error) {
    console.error('[v0] Accept Request - Error:', error)
    return { success: false, message: 'Failed to accept request' }
  }
}

/**
 * Decline a friend request
 */
export function declineFriendRequest(requestId: string, userId: string): { success: boolean; message: string } {
  try {
    const requests = JSON.parse(localStorage.getItem(FRIEND_REQUESTS_KEY) || '[]')
    const requestIndex = requests.findIndex((r: FriendRequest) => r.id === requestId)
    
    if (requestIndex === -1) {
      return { success: false, message: 'Request not found' }
    }
    
    const request = requests[requestIndex]
    
    if (request.toUserId !== userId) {
      return { success: false, message: 'Unauthorized' }
    }
    
    requests[requestIndex].status = 'declined'
    localStorage.setItem(FRIEND_REQUESTS_KEY, JSON.stringify(requests))
    
    return { success: true, message: 'Friend request declined' }
  } catch (error) {
    return { success: false, message: 'Failed to decline request' }
  }
}

/**
 * Remove a friend
 */
export function removeFriend(userId: string, friendUserId: string): { success: boolean; message: string } {
  try {
    const friends = JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]')
    
    // Remove from both sides
    const updated = friends.filter((f: Friend) => 
      !((f.userId === userId && f.friendCode.includes(friendUserId)) ||
        (f.userId === friendUserId && f.friendCode.includes(userId)))
    )
    
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(updated))
    
    return { success: true, message: 'Friend removed' }
  } catch (error) {
    return { success: false, message: 'Failed to remove friend' }
  }
}

/**
 * Initialize user in friends system
 */
export function initializeUser(userId: string, username: string): Friend {
  try {
    const friends = JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]')
    
    // Check if user already exists
    const existing = friends.find((f: Friend) => f.userId === userId)
    if (existing) return existing
    
    // Create user entry
    const userEntry: Friend = {
      id: `user_${userId}`,
      userId,
      username,
      friendCode: generateFriendCode(userId),
      addedAt: new Date().toISOString(),
      status: 'active'
    }
    
    friends.push(userEntry)
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends))
    
    return userEntry
  } catch (error) {
    // Return a default entry if error
    return {
      id: `user_${userId}`,
      userId,
      username,
      friendCode: generateFriendCode(userId),
      addedAt: new Date().toISOString(),
      status: 'active'
    }
  }
}
