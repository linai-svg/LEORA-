"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export function OnboardingDialog() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const hasSeenOnboarding = localStorage.getItem(`leora_onboarding_${user.id}`)
      if (!hasSeenOnboarding) {
        setTimeout(() => setOpen(true), 500)
      }
    }
  }, [user])

  const handleComplete = () => {
    if (user) {
      localStorage.setItem(`leora_onboarding_${user.id}`, "true")
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="text-4xl mb-2">🐆</div>
          <DialogTitle className="text-2xl">Welcome to Leora!</DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>I'm Leora, your personal productivity companion. I'm here to help you stay organized and motivated!</p>
            <p className="font-medium text-foreground">Here's what you can do:</p>
            <ul className="text-sm space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Track your daily mood and build positive habits</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Log study sessions and save handwritten notes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Set goals and track your progress</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Manage your weekly agenda and tasks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Create outfit combinations and track workouts</span>
              </li>
            </ul>
            <p className="text-primary font-medium pt-2">Let's get started!</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleComplete} className="w-full">
            Got it, let's go!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
