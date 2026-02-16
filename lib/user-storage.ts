/**
 * User-specific localStorage utilities
 * All user data is stored with userId as prefix to ensure data isolation
 */

export function getUserStorageKey(userId: string, key: string): string {
  return `leora_${userId}_${key}`
}

export function getUserData<T>(userId: string | undefined, key: string, defaultValue: T): T {
  if (!userId) return defaultValue
  
  try {
    const storageKey = getUserStorageKey(userId, key)
    const item = localStorage.getItem(storageKey)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`[v0] Failed to get user data for key ${key}:`, error)
    return defaultValue
  }
}

export function setUserData<T>(userId: string | undefined, key: string, value: T): boolean {
  if (!userId) {
    console.warn(`[v0] Cannot save data without userId for key ${key}`)
    return false
  }
  
  try {
    const storageKey = getUserStorageKey(userId, key)
    localStorage.setItem(storageKey, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`[v0] Failed to save user data for key ${key}:`, error)
    return false
  }
}

export function removeUserData(userId: string | undefined, key: string): boolean {
  if (!userId) return false
  
  try {
    const storageKey = getUserStorageKey(userId, key)
    localStorage.removeItem(storageKey)
    return true
  } catch (error) {
    console.error(`[v0] Failed to remove user data for key ${key}:`, error)
    return false
  }
}

export function clearUserData(userId: string): void {
  if (!userId) return
  
  const prefix = `leora_${userId}_`
  const keys = Object.keys(localStorage)
  
  keys.forEach(key => {
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key)
    }
  })
}
