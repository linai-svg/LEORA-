"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface MascotSettings {
  enabled: boolean
  tone: 'soft' | 'normal' | 'energetic'
  frequency: 'minimal' | 'normal' | 'frequent'
}

interface MascotContextType {
  settings: MascotSettings
  updateSettings: (settings: Partial<MascotSettings>) => void
}

const defaultSettings: MascotSettings = {
  enabled: true,
  tone: 'normal',
  frequency: 'normal'
}

const MascotContext = createContext<MascotContextType | undefined>(undefined)

export function MascotProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<MascotSettings>(
    "leora_mascot_settings",
    defaultSettings
  )

  const updateSettings = (newSettings: Partial<MascotSettings>) => {
    setSettings({ ...settings, ...newSettings })
  }

  return (
    <MascotContext.Provider value={{ settings, updateSettings }}>
      {children}
    </MascotContext.Provider>
  )
}

export function useMascot() {
  const context = useContext(MascotContext)
  if (context === undefined) {
    throw new Error('useMascot must be used within a MascotProvider')
  }
  return context
}
