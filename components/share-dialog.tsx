"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"

const SHARE_INTERVAL = 48 * 60 * 60 * 1000 // 48 hours in milliseconds
const STORAGE_KEY = "leora_last_share_prompt"
const FIRST_VISIT_KEY = "leora_first_visit"

export function ShareDialog() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if this is the first visit
    const isFirstVisit = !localStorage.getItem(FIRST_VISIT_KEY)
    
    if (isFirstVisit) {
      localStorage.setItem(FIRST_VISIT_KEY, new Date().toISOString())
      return // Don't show on first visit
    }

    // Check when we last showed the share message
    const lastShown = localStorage.getItem(STORAGE_KEY)
    const now = Date.now()

    if (!lastShown) {
      // Never shown before, show it now
      setIsOpen(true)
      localStorage.setItem(STORAGE_KEY, now.toString())
    } else {
      const timeSinceLastShown = now - parseInt(lastShown)
      
      if (timeSinceLastShown >= SHARE_INTERVAL) {
        // It's been 48+ hours, show again
        setIsOpen(true)
        localStorage.setItem(STORAGE_KEY, now.toString())
      }
    }
  }, [])

  const handleShare = async () => {
    const shareData = {
      title: "Leora - Your Personal Life Organizer",
      text: "Check out Leora! It helps me track my mood, fitness, outfits, and study sessions all in one place.",
      url: window.location.origin,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        )
        alert("Link copied to clipboard!")
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }

    setIsOpen(false)
  }

  const handleLater = () => {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span>💕</span>
            Share Leora with your friends
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            It really helps us improve your experience.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleLater}
            className="w-full sm:w-auto bg-transparent"
          >
            Later
          </Button>
          <Button
            onClick={handleShare}
            className="w-full sm:w-auto gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
