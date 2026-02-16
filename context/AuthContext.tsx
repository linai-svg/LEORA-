"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  isPremium: boolean
  premiumUntil?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem("leora_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse user data:", error)
        localStorage.removeItem("leora_user")
      }
    }
    setIsLoading(false)
  }, [])

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      console.log("[v0] Register attempt:", { email, name })
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem("leora_users") || "[]")
      console.log("[v0] Existing users count:", users.length)
      
      const existingUser = users.find((u: any) => u.email === email)
      
      if (existingUser) {
        console.log("[v0] Registration failed: User already exists")
        return false // User already exists
      }

      // Create new user
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        name,
        createdAt: new Date().toISOString(),
        isPremium: false, // Start with free tier
      }

      // Store password hash (in production, use bcrypt server-side)
      const hashedPassword = btoa(password) // Simple encoding for demo
      users.push({ ...newUser, password: hashedPassword })
      
      localStorage.setItem("leora_users", JSON.stringify(users))
      localStorage.setItem("leora_user", JSON.stringify(newUser))
      
      setUser(newUser)
      console.log("[v0] Registration successful, user created and logged in")
      return true
    } catch (error) {
      console.error("[v0] Registration error:", error)
      return false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("[v0] Login attempt:", { email })
      const users = JSON.parse(localStorage.getItem("leora_users") || "[]")
      console.log("[v0] Total users in database:", users.length)
      
      const hashedPassword = btoa(password)
      console.log("[v0] Looking for user with email:", email)
      
      const foundUser = users.find((u: any) => u.email === email && u.password === hashedPassword)
      console.log("[v0] User found:", !!foundUser)
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser
        localStorage.setItem("leora_user", JSON.stringify(userWithoutPassword))
        setUser(userWithoutPassword)
        console.log("[v0] Login successful, user set")
        return true
      }
      
      console.log("[v0] Login failed: Invalid credentials")
      return false
    } catch (error) {
      console.error("[v0] Login error:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("leora_user")
    setUser(null)
    router.push("/")
  }

  const updateUser = (updates: Partial<User>) => {
    if (!user) return
    
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("leora_user", JSON.stringify(updatedUser))
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem("leora_users") || "[]")
    const userIndex = users.findIndex((u: any) => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates }
      localStorage.setItem("leora_users", JSON.stringify(users))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
