"use client"

import { useState } from "react"
import { useUserStorage } from "@/hooks/use-user-storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Smile, Meh, Frown, Heart, TrendingUp, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { calculateStreak } from "@/utils/mood-utils"
import { getLeoraMoodMessage } from "@/lib/leora-section-messages"

interface MoodEntry {
  id: string
  mood: "great" | "good" | "okay" | "bad" | "terrible"
  note: string
  date: string
  createdAt: string
}

const moods = [
  {
    value: "great",
    label: "Great",
    icon: "😊",
    color: "from-green-100 to-green-50",
    hoverColor: "hover:shadow-lg hover:scale-105",
    borderColor: "border-green-200",
    textColor: "text-green-700"
  },
  {
    value: "good",
    label: "Good",
    icon: "🙂",
    color: "from-teal-100 to-teal-50",
    hoverColor: "hover:shadow-lg hover:scale-105",
    borderColor: "border-teal-200",
    textColor: "text-teal-700"
  },
  {
    value: "okay",
    label: "Okay",
    icon: "😐",
    color: "from-yellow-100 to-yellow-50",
    hoverColor: "hover:shadow-lg hover:scale-105",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700"
  },
  {
    value: "bad",
    label: "Bad",
    icon: "🙁",
    color: "from-orange-100 to-orange-50",
    hoverColor: "hover:shadow-lg hover:scale-105",
    borderColor: "border-orange-200",
    textColor: "text-orange-700"
  },
  {
    value: "terrible",
    label: "Terrible",
    icon: "😢",
    color: "from-red-100 to-red-50",
    hoverColor: "hover:shadow-lg hover:scale-105",
    borderColor: "border-red-200",
    textColor: "text-red-700"
  },
]

export default function MoodPage() {
  const [moodEntries, setMoodEntries] = useUserStorage<MoodEntry[]>("mood_entries", [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const [selectedMood, setSelectedMood] = useState<'great' | 'good' | 'okay' | 'bad' | 'terrible' | null>(null)
  const [note, setNote] = useState("")

  const todayEntry = moodEntries.find(entry => entry.date === new Date().toISOString().split("T")[0])

  const handleSaveMood = () => {
    if (!selectedMood) {
      toast({
        title: "Select a mood",
        description: "Please select how you're feeling.",
        variant: "destructive",
      })
      return
    }

    const todayDate = new Date().toISOString().split("T")[0]
    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      mood: selectedMood,
      note: note,
      date: todayDate,
      createdAt: new Date().toISOString(),
    }

    // Filter out old entry for today if exists, then add new one
    const updatedEntries = [entry, ...moodEntries.filter(e => e.date !== entry.date)]
    setMoodEntries(updatedEntries)
    setIsDialogOpen(false)
    setSelectedMood(null)
    setNote("")
    
    toast({
      title: "Mood logged",
      description: "Your mood has been recorded for today.",
    })
  }


  
  const moodCounts = moodEntries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]
  const streak = calculateStreak(moodEntries)

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Leora Mood Message */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-200 rounded-xl p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🐆</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{getLeoraMoodMessage()}</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold mb-2">Mood Tracker</h1>
        <p className="text-muted-foreground">Track how you're feeling every day</p>
      </div>

      {/* Today's Mood Card */}
      <Card className="border-2 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            How are you feeling today?
          </CardTitle>
          <CardDescription>
            {todayEntry ? "You've logged your mood today" : "Log your mood to track your emotional wellbeing"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayEntry ? (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
              <div className="text-5xl">{moods.find(m => m.value === todayEntry.mood)?.icon}</div>
              <div>
                <p className="font-medium text-lg capitalize">{todayEntry.mood}</p>
                {todayEntry.note && <p className="text-sm text-muted-foreground mt-1">{todayEntry.note}</p>}
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsDialogOpen(true)} size="lg" className="w-full">
              <Plus className="mr-2 h-5 w-5" />
              Log today's mood
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Tracking Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{streak} {streak === 1 ? 'day' : 'days'}</div>
            <p className="text-sm text-muted-foreground mt-1">Keep it up!</p>
          </CardContent>
        </Card>

        {mostCommonMood && (
          <Card className="border-2 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="h-5 w-5 text-yellow-500" />
                Most Common
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="text-4xl">{moods.find(m => m.value === mostCommonMood[0])?.icon}</div>
                <div>
                  <p className="text-2xl font-bold capitalize">{mostCommonMood[0]}</p>
                  <p className="text-sm text-muted-foreground">{mostCommonMood[1]} times</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Entries */}
      {moodEntries.length > 0 && (
        <Card className="border-2 shadow-soft">
          <CardHeader>
            <CardTitle>Recent Moods</CardTitle>
            <CardDescription>Your mood history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moodEntries.slice(0, 5).map((entry) => {
                const mood = moods.find(m => m.value === entry.mood)
                return (
                  <div key={entry.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted">
                    <div className="text-3xl">{mood?.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium capitalize">{entry.mood}</p>
                        <p className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                      {entry.note && <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood Logging Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>How are you feeling?</DialogTitle>
            <DialogDescription>Select your mood and add a note if you'd like</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-5 gap-3">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value as any)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 bg-gradient-to-br ${mood.color} ${mood.borderColor} transition-all ${mood.hoverColor} ${selectedMood === mood.value ? 'ring-2 ring-primary ring-offset-2 scale-105' : ''}`}
                >
                  <div className="text-4xl">{mood.icon}</div>
                  <div className={`text-xs font-medium ${mood.textColor}`}>{mood.label}</div>
                </button>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Note (optional)</label>
              <Textarea
                placeholder="What's on your mind?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMood} disabled={!selectedMood}>Save Mood</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
