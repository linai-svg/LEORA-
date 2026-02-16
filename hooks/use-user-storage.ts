'use client';

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { getUserData, setUserData } from "@/lib/user-storage"

/**
 * Hook for user-specific localStorage that automatically links data to authenticated user
 * Falls back to empty state if user is not authenticated
 */
export function useUserStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const { user } = useAuth()
  const [value, setValue] = useState<T>(() => {
    return getUserData(user?.id, key, defaultValue)
  })

  // Update localStorage when value changes
  useEffect(() => {
    if (user?.id) {
      setUserData(user.id, key, value)
    }
  }, [value, user?.id, key])

  // Load data when user changes (login/logout)
  useEffect(() => {
    if (user?.id) {
      const loadedData = getUserData(user.id, key, defaultValue)
      setValue(loadedData)
    } else {
      setValue(defaultValue)
    }
  }, [user?.id, key])

  return [value, setValue]
}
