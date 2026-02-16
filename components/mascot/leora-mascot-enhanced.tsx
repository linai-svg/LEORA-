"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMascot } from "@/context/MascotContext"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LeoraMascotEnhancedProps {
  section: 'home' | 'agenda' | 'study' | 'notes' | 'goals' | 'mood' | 'sport' | 'outfits' | 'photo-dump'
  achievement?: 'step-complete' | 'goal-25' | 'goal-50' | 'goal-75' | 'goal-100' | 'streak' | 'first-entry'
  customMessage?: string
  autoHide?: boolean
  autoHideDelay?: number
  userMood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible'
}

export function LeoraMascotEnhanced({ 
  section, 
  achievement, 
  customMessage,
  autoHide = true,
  autoHideDelay = 5000,
  userMood
}: LeoraMascotEnhancedProps) {
  const { settings } = useMascot()
  const [isVisible, setIsVisible] = useState(true)
  const [animation, setAnimation] = useState<'idle' | 'celebrate' | 'wave'>('idle')

  useEffect(() => {
    if (!settings.enabled) {
      setIsVisible(false)
      return
    }

    // Set animation based on achievement
    if (achievement) {
      if (achievement.includes('goal-')) {
        setAnimation('celebrate')
      } else {
        setAnimation('wave')
      }
    }

    // Auto-hide logic
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, autoHideDelay)
      return () => clearTimeout(timer)
    }
  }, [settings.enabled, achievement, autoHide, autoHideDelay])

  const getMessage = (): string => {
    if (customMessage) return customMessage

    // Mood-aware messages (overrides section messages when mood is provided)
    if (userMood) {
      const moodMessages = {
        'great': {
          soft: 'I\'m glad you\'re feeling wonderful today.',
          normal: 'That\'s amazing! Your positive energy is inspiring!',
          energetic: 'YES! Your energy is INCREDIBLE today! Ride that wave!'
        },
        'good': {
          soft: 'It\'s nice to see you\'re doing well.',
          normal: 'Great to hear you\'re feeling good today!',
          energetic: 'Awesome vibes! Keep that positivity flowing!'
        },
        'okay': {
          soft: 'I hope your day gets even better.',
          normal: 'Every day has its ups and downs. You\'re doing fine!',
          energetic: 'It\'s okay to feel okay! Tomorrow could be amazing!'
        },
        'bad': {
          soft: 'I\'m here with you. Take it one step at a time.',
          normal: 'Tough days happen. Remember, this will pass.',
          energetic: 'Hey, bad days don\'t last forever! You\'ve got this!'
        },
        'terrible': {
          soft: 'I\'m really sorry you\'re going through this. Be gentle with yourself.',
          normal: 'I see you\'re struggling. It\'s okay to take a break and rest.',
          energetic: 'You\'re stronger than you know. This moment doesn\'t define you!'
        }
      }
      return moodMessages[userMood]?.[settings.tone] || moodMessages[userMood].normal
    }

    // Achievement messages
    if (achievement) {
      const achievementMessages = {
        'step-complete': {
          soft: 'Nice work on that step.',
          normal: 'Great job completing that step!',
          energetic: 'YES! Another step crushed! Keep going!'
        },
        'goal-25': {
          soft: 'You\'ve made a good start.',
          normal: 'Great progress! You\'re 25% there!',
          energetic: 'WOW! 25% done! You\'re on fire!'
        },
        'goal-50': {
          soft: 'You\'re halfway through.',
          normal: 'Amazing! You\'re halfway there!',
          energetic: 'HALFWAY DONE! You\'re absolutely crushing it!'
        },
        'goal-75': {
          soft: 'Almost there now.',
          normal: 'So close! 75% complete!',
          energetic: 'YOU\'RE SO CLOSE! 75% - The finish line is in sight!'
        },
        'goal-100': {
          soft: 'Well done on completing your goal.',
          normal: 'Congratulations! Goal achieved!',
          energetic: '🎉 GOAL COMPLETE! You absolutely NAILED it!'
        },
        'streak': {
          soft: 'You\'re keeping up your streak.',
          normal: 'Great job maintaining your streak!',
          energetic: 'STREAK POWER! You\'re unstoppable!'
        },
        'first-entry': {
          soft: 'Good start today.',
          normal: 'Welcome! Great to see you logging your first entry!',
          energetic: 'FIRST ENTRY! Amazing start! Let\'s make today count!'
        }
      }
      return achievementMessages[achievement]?.[settings.tone] || achievementMessages[achievement].normal
    }

    // Section-specific messages
    const sectionMessages = {
      home: {
        soft: 'Welcome back.',
        normal: 'Hey there! Ready to make today productive?',
        energetic: 'Welcome back! Let\'s make today AMAZING!'
      },
      agenda: {
        soft: 'Let\'s plan your day.',
        normal: 'Time to organize your tasks!',
        energetic: 'Let\'s CRUSH that to-do list today!'
      },
      study: {
        soft: 'Focus time.',
        normal: 'Time to learn something new!',
        energetic: 'Let\'s LEARN and GROW! You\'ve got this!'
      },
      notes: {
        soft: 'Capture your thoughts.',
        normal: 'Ready to jot down some ideas?',
        energetic: 'Let those creative ideas FLOW!'
      },
      goals: {
        soft: 'Work on your goals.',
        normal: 'Let\'s make progress on those goals!',
        energetic: 'GOAL TIME! Let\'s make dreams happen!'
      },
      mood: {
        soft: 'I\'m here to listen. How are you feeling?',
        normal: 'How are you feeling today? I\'m here for you.',
        energetic: 'Let\'s check in on those vibes! How\'s your day going?'
      },
      sport: {
        soft: 'Time to move.',
        normal: 'Ready for some activity?',
        energetic: 'TIME TO GET MOVING! Let\'s DO THIS!'
      },
      outfits: {
        soft: 'Express yourself.',
        normal: 'Planning your style today?',
        energetic: 'Let\'s pick something FABULOUS!'
      },
      'photo-dump': {
        soft: 'Capture the moment.',
        normal: 'Share your day with a photo!',
        energetic: 'SNAP IT! Let\'s capture those awesome moments!'
      }
    }

    return sectionMessages[section]?.[settings.tone] || sectionMessages[section].normal
  }

  const getAnimationVariants = () => {
    switch (animation) {
      case 'celebrate':
        return {
          initial: { scale: 0, rotate: -180 },
          animate: { 
            scale: 1, 
            rotate: 0,
            transition: { type: "spring", duration: 0.6 }
          },
          exit: { scale: 0, opacity: 0 }
        }
      case 'wave':
        return {
          initial: { x: -100, opacity: 0 },
          animate: { 
            x: 0, 
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
          },
          exit: { x: -100, opacity: 0 }
        }
      default:
        return {
          initial: { y: 20, opacity: 0 },
          animate: { 
            y: 0, 
            opacity: 1,
            transition: { duration: 0.4 }
          },
          exit: { y: 20, opacity: 0 }
        }
    }
  }

  if (!settings.enabled || !isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 right-6 z-50 max-w-sm"
          {...getAnimationVariants()}
        >
          <Card className="p-4 shadow-lg border-2 border-primary/20 bg-background/95 backdrop-blur">
            <div className="flex items-start gap-3">
              {/* Leopard Avatar */}
              <div className="text-4xl flex-shrink-0">
                🐆
              </div>
              
              {/* Message */}
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {getMessage()}
                </p>
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LeoraMascotEnhanced
