"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Check, Trash2, Clock, TrendingUp, Flame, Calendar, Target, Sparkles, Edit, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { LeoraMascotEnhanced } from "@/components/mascot/leora-mascot-enhanced"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { sportService } from "@/lib/sport-service"
import { 
  SportSession, 
  SportType, 
  Intensity, 
  DayOfWeek,
  SPORT_TYPE_LABELS,
  INTENSITY_LABELS,
  DAY_LABELS 
} from "@/lib/sport-types"
import {
  getSessionCompletionFeedback,
  getPreSessionMotivation,
  getStreakLostFeedback
} from "@/lib/sport-leora-feedback"
import { getLeoraSportMessage } from "@/lib/leora-section-messages"

const DAYS_OF_WEEK: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default function SportPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plan' | 'stats'>('dashboard')
  const [sessions, setSessions] = useState<SportSession[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SportSession | null>(null)
  const [leoraMessage, setLeoraMessage] = useState<string | null>(null)
  const [completionData, setCompletionData] = useState({
    notes: '',
    feeling: ''
  })
  
  const [newSession, setNewSession] = useState({
    sportType: 'gym' as SportType,
    duration: 30,
    intensity: 'medium' as Intensity,
    dayOfWeek: 'monday' as DayOfWeek,
    plannedDate: new Date().toISOString().split('T')[0]
  })

  // Load sessions
  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = () => {
    const allSessions = sportService.getAllSessions()
    setSessions(allSessions)
  }

  // Get current week sessions
  const getWeekStart = () => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const start = new Date(now.setDate(diff))
    start.setHours(0, 0, 0, 0)
    return start
  }

  const weekStart = getWeekStart()
  const weekSessions = sportService.getSessionsForWeek(weekStart, user?.id || 'guest')
  const stats = sportService.getStats(user?.id || 'guest')

  // Add session
  const handleAddSession = () => {
    if (!newSession.sportType || !newSession.duration) {
      toast({
        title: "Missing information",
        description: "Please provide sport type and duration.",
        variant: "destructive"
      })
      return
    }

    const session = sportService.createSession({
      userId: user?.id || 'guest',
      sportType: newSession.sportType,
      duration: newSession.duration,
      intensity: newSession.intensity,
      plannedDate: newSession.plannedDate,
      dayOfWeek: newSession.dayOfWeek,
      isCompleted: false
    })

    loadSessions()
    setIsAddDialogOpen(false)
    setNewSession({
      sportType: 'gym',
      duration: 30,
      intensity: 'medium',
      dayOfWeek: 'monday',
      plannedDate: new Date().toISOString().split('T')[0]
    })
    
    toast({
      title: "Session added",
      description: "Your workout has been scheduled."
    })

    // Show pre-session motivation
    const motivation = getPreSessionMotivation()
    setLeoraMessage(motivation)
    setTimeout(() => setLeoraMessage(null), 8000)
  }

  // Complete session
  const handleCompleteSession = (session: SportSession) => {
    setSelectedSession(session)
    setIsCompleteDialogOpen(true)
    setCompletionData({ notes: '', feeling: '' })
  }

  const confirmCompleteSession = () => {
    if (!selectedSession) return

    const completed = sportService.completeSession(
      selectedSession.id,
      completionData.notes,
      completionData.feeling
    )

    if (completed) {
      loadSessions()
      
      // Calculate if all sessions for week are complete
      const updatedSessions = sportService.getSessionsForWeek(weekStart, user?.id || 'guest')
      const allComplete = updatedSessions.every(s => s.isCompleted)
      
      // Get updated stats
      const updatedStats = sportService.getStats(user?.id || 'guest')
      
      // Generate Leora feedback
      const isFirstSession = sportService.getAllSessions().filter(s => s.isCompleted).length === 1
      const feedback = getSessionCompletionFeedback(
        completed,
        updatedStats.currentStreak,
        isFirstSession,
        allComplete
      )
      
      setLeoraMessage(feedback)
      setTimeout(() => setLeoraMessage(null), 10000)
      
      toast({
        title: "Session completed!",
        description: `Great job! ${updatedStats.currentStreak > 0 ? `${updatedStats.currentStreak} day streak!` : ''}`
      })
    }

    setIsCompleteDialogOpen(false)
    setSelectedSession(null)
  }

  // Delete session
  const handleDeleteSession = (id: string) => {
    sportService.deleteSession(id)
    loadSessions()
    toast({
      title: "Session deleted",
      description: "Workout has been removed."
    })
  }

  // Group sessions by day
  const sessionsByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = weekSessions.filter(s => s.dayOfWeek === day)
    return acc
  }, {} as Record<DayOfWeek, SportSession[]>)

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Leora Sport Message */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🐆</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#1F1F1F]">
              {getLeoraSportMessage(stats.weeklySessionsCompleted > 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold">Sport & Fitness</h1>
        <p className="text-muted-foreground mt-1">Your personal training companion</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="plan">Weekly Plan</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* DASHBOARD TAB */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.currentStreak}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.currentStreak === 1 ? 'day' : 'days'} in a row
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Math.floor(stats.weeklyTotal / 60)}h {stats.weeklyTotal % 60}m</div>
                <p className="text-xs text-muted-foreground">
                  {stats.weeklySessionsCompleted} sessions
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Math.floor(stats.monthlyTotal / 60)}h</div>
                <p className="text-xs text-muted-foreground">
                  {stats.monthlySessionsCompleted} sessions
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  Best Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.longestStreak}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.longestStreak === 1 ? 'day' : 'days'} record
                </p>
              </CardContent>
            </Card>
          </div>

          {/* This Week Overview */}
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>This Week's Sessions</CardTitle>
                  <CardDescription>
                    {stats.weeklySessionsCompleted} of {weekSessions.length} completed
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Session
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {weekSessions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No sessions planned this week</p>
                  <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
                    Plan Your First Session
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {weekSessions.map(session => (
                    <div
                      key={session.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        session.isCompleted 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">
                              {SPORT_TYPE_LABELS[session.sportType]}
                            </h3>
                            {session.isCompleted && (
                              <Badge className="bg-green-500">
                                <Check className="h-3 w-3 mr-1" />
                                Done
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.duration} min
                            </span>
                            <Badge variant="outline">
                              {INTENSITY_LABELS[session.intensity]}
                            </Badge>
                            <span>{DAY_LABELS[session.dayOfWeek]}</span>
                          </div>
                          {session.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{session.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!session.isCompleted && (
                            <Button
                              size="sm"
                              onClick={() => handleCompleteSession(session)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WEEKLY PLAN TAB */}
        <TabsContent value="plan" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Weekly Training Plan</CardTitle>
                  <CardDescription>Plan your workouts for the week</CardDescription>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Session
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DAYS_OF_WEEK.map(day => {
                  const daySessions = sessionsByDay[day]
                  return (
                    <Card key={day} className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{DAY_LABELS[day]}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {daySessions.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Rest day</p>
                        ) : (
                          <div className="space-y-2">
                            {daySessions.map(session => (
                              <div key={session.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                <div className="flex items-center gap-2">
                                  {session.isCompleted && <Check className="h-4 w-4 text-green-500" />}
                                  <span className="text-sm font-medium">
                                    {SPORT_TYPE_LABELS[session.sportType]}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {session.duration} min
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {INTENSITY_LABELS[session.intensity]}
                                  </Badge>
                                </div>
                                <div className="flex gap-1">
                                  {!session.isCompleted && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleCompleteSession(session)}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteSession(session.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STATISTICS TAB */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Streak Card */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Streak Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                  <div className="text-5xl font-bold text-orange-600 mb-2">
                    {stats.currentStreak}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stats.currentStreak === 1 ? 'Day' : 'Days'} in a row
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Streak</span>
                    <span className="font-medium">{stats.currentStreak} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Best Streak</span>
                    <span className="font-medium">{stats.longestStreak} days</span>
                  </div>
                  <Progress 
                    value={(stats.currentStreak / Math.max(stats.longestStreak, 1)) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Time Stats */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Training Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">This Week</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {Math.floor(stats.weeklyTotal / 60)}h {stats.weeklyTotal % 60}m
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.weeklySessionsCompleted} sessions completed
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">This Month</span>
                      <span className="text-2xl font-bold text-green-600">
                        {Math.floor(stats.monthlyTotal / 60)}h {stats.monthlyTotal % 60}m
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.monthlySessionsCompleted} sessions completed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All Time Summary */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>All Time Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-3xl font-bold mb-1">
                    {sessions.filter(s => s.isCompleted).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-3xl font-bold mb-1">
                    {Math.floor(sessions.filter(s => s.isCompleted).reduce((sum, s) => sum + s.duration, 0) / 60)}h
                  </div>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-3xl font-bold mb-1">
                    {stats.longestStreak}
                  </div>
                  <p className="text-sm text-muted-foreground">Best Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Session Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Training Session</DialogTitle>
            <DialogDescription>Schedule a new workout session</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sport Type</Label>
              <Select
                value={newSession.sportType}
                onValueChange={(value: SportType) => setNewSession({ ...newSession, sportType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SPORT_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min="1"
                  value={newSession.duration}
                  onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Intensity</Label>
                <Select
                  value={newSession.intensity}
                  onValueChange={(value: Intensity) => setNewSession({ ...newSession, intensity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(INTENSITY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select
                  value={newSession.dayOfWeek}
                  onValueChange={(value: DayOfWeek) => setNewSession({ ...newSession, dayOfWeek: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day} value={day}>
                        {DAY_LABELS[day]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newSession.plannedDate}
                  onChange={(e) => setNewSession({ ...newSession, plannedDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSession}>Add Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Session Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Session</DialogTitle>
            <DialogDescription>How did your workout go?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>How do you feel?</Label>
              <Select
                value={completionData.feeling}
                onValueChange={(value) => setCompletionData({ ...completionData, feeling: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select feeling" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="great">💪 Great - Feeling strong!</SelectItem>
                  <SelectItem value="good">😊 Good - Solid session</SelectItem>
                  <SelectItem value="okay">😐 Okay - Got it done</SelectItem>
                  <SelectItem value="tired">😓 Tired - But completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Any notes about this session..."
                value={completionData.notes}
                onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCompleteSession} className="bg-green-500 hover:bg-green-600">
              <Check className="h-4 w-4 mr-2" />
              Mark as Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leora Mascot with Feedback */}
      {leoraMessage ? (
        <LeoraMascotEnhanced 
          section="sport"
          customMessage={leoraMessage}
          autoHide={true}
          autoHideDelay={10000}
        />
      ) : (
        <LeoraMascotEnhanced 
          section="sport"
          autoHide={true}
          autoHideDelay={6000}
        />
      )}
    </div>
  )
}
