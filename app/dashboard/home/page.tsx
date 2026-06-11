"use client"

import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Target, Heart, Dumbbell, TrendingUp, Sparkles, Shirt, Flame } from "lucide-react"
import { useUserStorage } from "@/hooks/use-user-storage"
import { useLocalStorage } from "@/hooks/use-local-storage"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { generateOutfit, validateWardrobe } from "@/lib/outfit-generation"
import { useToast } from "@/hooks/use-toast"
import { sportService } from "@/lib/sport-service"
import { Progress } from "@/components/ui/progress"
import { getLeoraHomeMessage } from "@/lib/leora-section-messages"
import { ShareDialog } from "@/components/share-dialog"
import { OnboardingDialog } from "@/components/onboarding-dialog"
import { calculateStreak } from "@/utils/mood-utils"
import { getPhotoStreak } from "@/lib/photo-streak-service"

interface MoodEntry {
  date: string
  mood: "great" | "good" | "okay" | "bad" | "terrible"
  note?: string
}

interface SportActivity {
  id: string
  type: string
  duration: number
  date: string
  intensity: "low" | "medium" | "high"
}

export default function HomePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [greeting, setGreeting] = useState("Hello")
  const [moodEntries] = useUserStorage<MoodEntry[]>("mood_entries", [])
  const [sportActivities] = useLocalStorage<SportActivity[]>("leora_sport", [])
  const [clothingItems] = useLocalStorage<any[]>("leora_clothing_items", [])
  const [savedOutfits] = useLocalStorage<any[]>("leora_saved_outfits", [])
  const [sportStats, setSportStats] = useState<any>(null)
  const [totalMinutesThisWeek, setTotalMinutesThisWeek] = useState<number>(0)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
    
    // Load sport stats
    if (user?.id) {
      const stats = sportService.getStats(user.id)
      setSportStats(stats)
    }

    // Calculate total minutes this week
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const thisWeekActivities = sportActivities.filter(activity => {
      const activityDate = new Date(activity.date)
      return activityDate >= weekAgo
    })
    const totalMinutes = thisWeekActivities.reduce((sum, activity) => sum + activity.duration, 0)
    setTotalMinutesThisWeek(totalMinutes)
  }, [user?.id, sportActivities])

  const thisWeekMoods = moodEntries.filter(entry => {
    const entryDate = new Date(entry.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return entryDate >= weekAgo
  })

  const moodStreak = calculateStreak(moodEntries)
  const photoStreak = getPhotoStreak()

  const handleGenerateOutfit = () => {
    const validation = validateWardrobe(clothingItems)

    if (!validation.isValid) {
      toast({
        title: "Incomplete wardrobe",
        description: validation.errorMessage,
        variant: "destructive",
      })
      return
    }

    const outfit = generateOutfit(clothingItems, new Date().toISOString(), user?.id || "guest")

    if (outfit) {
      toast({
        title: "Outfit generated!",
        description: "Check the Outfits section to see your new look.",
      })
    } else {
      toast({
        title: "Could not generate outfit",
        description: "Make sure you have enough clothing items in your wardrobe.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Onboarding Dialog - Shows once for new users */}
      <OnboardingDialog />
      
      {/* Share Dialog - Shows every 48 hours */}
      <ShareDialog />
      
      {/* Leora Home Message */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border border-primary/20 rounded-2xl p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🐆</div>
          <div className="flex-1">
            <p className="text-base font-medium text-foreground leading-relaxed">{getLeoraHomeMessage()}</p>
          </div>
        </div>
      </div>

      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-2 gradient-text">
            {greeting}, {user?.name || "there"}
          </h1>
          <p className="text-muted-foreground text-lg">Welcome back to Leora</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Mood Streak */}
        <Card className="card-premium bg-gradient-to-br from-rose-50 to-pink-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold">Mood Streak</CardTitle>
            <div className="p-2 bg-rose-100 rounded-lg">
              <Heart className="h-5 w-5 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{moodStreak}</div>
            <p className="text-sm text-muted-foreground mt-1">{moodStreak === 1 ? 'day' : 'days'} streak</p>
          </CardContent>
        </Card>

        {/* Wardrobe Items */}
        <Card className="card-premium bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold">Wardrobe Items</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shirt className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{clothingItems.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Total items</p>
          </CardContent>
        </Card>

        {/* Photo Streak */}
        <Card className="card-premium bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold">Photo Streak</CardTitle>
            <div className="p-2 bg-pink-100 rounded-lg">
              <Flame className="h-5 w-5 text-pink-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{photoStreak.currentStreak}</div>
            <p className="text-sm text-muted-foreground mt-1">{photoStreak.currentStreak === 1 ? 'day' : 'days'} streak</p>
          </CardContent>
        </Card>
        
        {/* Saved Outfits */}
        <Card className="card-premium bg-gradient-to-br from-teal-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold">Saved Outfits</CardTitle>
            <div className="p-2 bg-teal-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{savedOutfits.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Your collection</p>
          </CardContent>
        </Card>
      </div>

      {/* Sport Summary */}
      <Card className="card-premium bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 bg-orange-100 rounded-2xl shadow-sm">
                  <Dumbbell className="h-7 w-7 text-orange-600" />
                </div>
                Sport & Fitness
              </CardTitle>
              <CardDescription className="mt-2 text-base">Your weekly training progress</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="bg-white/80 border-orange-300 hover:bg-orange-50 hover:border-orange-400 transition-all">
              <Link href="/dashboard/sport">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sportStats ? (
            <div className="space-y-4">
              {/* Streak Display */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <Flame className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1F1F1F]">{sportStats.currentStreak}</p>
                    <p className="text-sm text-[#8F8F8F]">Week Streak</p>
                  </div>
                </div>
                <div className="text-right">
                  {sportStats.weeklySessionsCompleted > 0 ? (
                    <p className="text-sm font-medium text-green-600">Week completed ✓</p>
                  ) : (
                    <p className="text-sm text-[#8F8F8F]">Log a workout this week</p>
                  )}
                </div>
              </div>

              {/* Weekly Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8F8F8F]">This week</span>
                  <span className="font-medium">{sportStats.weeklySessionsCompleted} sessions</span>
                </div>
                <Progress value={(sportStats.weeklySessionsCompleted / 3) * 100} className="h-2" />
                <p className="text-xs text-[#8F8F8F]">
                  {Math.floor(sportStats.weeklyTotal / 60)}h {sportStats.weeklyTotal % 60}min total
                </p>
              </div>

              {/* Last Workout */}
              {sportStats.lastSessionDate && (
                <div className="text-xs text-[#8F8F8F]">
                  Last workout: {new Date(sportStats.lastSessionDate).toLocaleDateString()}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Dumbbell className="h-12 w-12 text-[#8F8F8F]/30 mx-auto mb-3" />
              <p className="text-[#8F8F8F] mb-3">No workouts logged yet</p>
              <Button asChild size="sm">
                <Link href="/dashboard/sport">Start Training</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outfit Quick Access */}
      <Card className="card-premium bg-gradient-to-br from-primary/10 to-accent/5 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-3 bg-primary/20 rounded-2xl shadow-sm">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            Outfit Generator
          </CardTitle>
          <CardDescription className="mt-2 text-base">Get AI-powered outfit suggestions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {clothingItems.length === 0 ? (
            <div className="text-center py-4">
              <Shirt className="h-12 w-12 text-[#8F8F8F]/30 mx-auto mb-2" />
              <p className="text-sm text-[#8F8F8F] mb-3">Add items to your wardrobe first</p>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/outfits">Go to Wardrobe</Link>
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Generate a complete outfit based on weather and your wardrobe
              </p>
              <div className="flex gap-2">
                <Button onClick={handleGenerateOutfit} className="flex-1">
                  Generate Outfit
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/outfits">View All</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-soft border-2 hover:shadow-lg transition-all hover:scale-105 duration-300 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="p-3 bg-blue-100 rounded-xl w-fit mb-2">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Agenda</CardTitle>
            <CardDescription>Plan your week ahead</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/agenda">Open Agenda</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-2 hover:shadow-lg transition-all hover:scale-105 duration-300 bg-gradient-to-br from-green-50 to-teal-50">
          <CardHeader>
            <div className="p-3 bg-green-100 rounded-xl w-fit mb-2">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">Goals</CardTitle>
            <CardDescription>Track your achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/goals">View Goals</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-2 hover:shadow-lg transition-all hover:scale-105 duration-300 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <div className="p-3 bg-purple-100 rounded-xl w-fit mb-2">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-xl">Study</CardTitle>
            <CardDescription>Learning tracker</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/study">Start Study</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
