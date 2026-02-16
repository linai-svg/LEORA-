"use client"

import { useState } from "react"
import { useUserStorage } from "@/hooks/use-user-storage"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Plus, Trash2, Clock, GraduationCap, PenTool, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { DrawingCanvas } from "@/components/study/drawing-canvas"
import type { StudyPage, Stroke } from "@/types"
import { getLeoraStudyMessage } from "@/lib/leora-section-messages"
import { createThumbnail } from "@/lib/create-thumbnail"

interface StudySession {
  id: string
  subject: string
  topic: string
  duration: number // in minutes
  notes: string
  date: string
  createdAt: string
}

interface StudySubject {
  id: string
  name: string
  color: string
}

const defaultSubjects: StudySubject[] = [
  { id: "1", name: "Mathematics", color: "bg-blue-500" },
  { id: "2", name: "Science", color: "bg-green-500" },
  { id: "3", name: "Languages", color: "bg-purple-500" },
  { id: "4", name: "History", color: "bg-amber-500" },
  { id: "5", name: "Arts", color: "bg-pink-500" },
  { id: "6", name: "Other", color: "bg-gray-500" },
]

const StudyTracker = () => {
  const { user } = useAuth()
  const [studySessions, setStudySessions] = useUserStorage<StudySession[]>("study_sessions", [])
  const [subjects] = useUserStorage<StudySubject[]>("study_subjects", defaultSubjects)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSession, setNewSession] = useState({
    subject: "",
    topic: "",
    duration: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  })
  const { toast } = useToast()
  const [currentStrokes, setCurrentStrokes] = useState<Stroke[]>([])
  const [studyPages, setStudyPages] = useUserStorage<StudyPage[]>("handwriting_pages", [])
  const [currentSubject, setCurrentSubject] = useState("")
  const [currentTopic, setCurrentTopic] = useState("")
  const [activeTab, setActiveTab] = useState("quick-log")

  const handleAddSession = () => {
    if (!newSession.subject || !newSession.topic || !newSession.duration) {
      toast({
        title: "Missing information",
        description: "Please fill in subject, topic, and duration.",
        variant: "destructive",
      })
      return
    }

    const session: StudySession = {
      id: crypto.randomUUID(),
      subject: newSession.subject,
      topic: newSession.topic,
      duration: Number.parseInt(newSession.duration),
      notes: newSession.notes,
      date: newSession.date,
      createdAt: new Date().toISOString(),
    }

    setStudySessions([session, ...studySessions])
    setNewSession({
      subject: "",
      topic: "",
      duration: "",
      notes: "",
      date: new Date().toISOString().split("T")[0],
    })
    setIsDialogOpen(false)
    
    toast({
      title: "Study session added",
      description: "Your study session has been recorded.",
    })
  }

  const deleteSession = (id: string) => {
    setStudySessions(studySessions.filter((session) => session.id !== id))
    toast({
      title: "Session deleted",
      description: "Study session has been removed.",
    })
  }

  // Handwriting functions
  const handleSaveHandwriting = () => {
    if (currentStrokes.length === 0) {
      toast({
        title: "Nothing to save",
        description: "Please draw something first.",
        variant: "destructive",
      })
      return
    }

    if (!currentSubject || !currentTopic) {
      toast({
        title: "Missing information",
        description: "Please enter subject and topic before saving.",
        variant: "destructive",
      })
      return
    }

    const page: StudyPage = {
      id: crypto.randomUUID(),
      userId: user?.id || "guest",
      subject: currentSubject,
      topic: currentTopic,
      pageNumber: studyPages.filter(p => p.subject === currentSubject).length + 1,
      strokes: currentStrokes,
      canvasWidth: 800,
      canvasHeight: 600,
      thumbnail: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setStudyPages([...studyPages, page])
    setCurrentStrokes([])
    setCurrentSubject("")
    setCurrentTopic("")

    toast({
      title: "Free handwriting saved!",
      description: `Saved to ${currentSubject} - ${currentTopic}`,
    })
  }

  const deleteStudyPage = (id: string) => {
    setStudyPages(studyPages.filter(page => page.id !== id))
    toast({
      title: "Page deleted",
      description: "Study page has been removed.",
    })
  }

  const handleOpenStudyPage = (page: StudyPage) => {
    setCurrentStrokes(page.strokes)
    setCurrentSubject(page.subject)
    setCurrentTopic(page.topic)
    setActiveTab("draw-notes")
    
    toast({
      title: "Handwriting loaded",
      description: `Opened ${page.subject} - ${page.topic}`,
    })
  }



  const getSubjectColor = (subjectName: string) => {
    const subject = subjects.find((s) => s.name === subjectName)
    return subject?.color || "bg-gray-500"
  }

  // Calculate total study time this week
  const getWeekStart = () => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(now.setDate(diff)).toISOString().split("T")[0]
  }

  const weekStart = getWeekStart()
  const thisWeekSessions = studySessions.filter((session) => session.date >= weekStart)
  const totalWeekMinutes = thisWeekSessions.reduce((sum, session) => sum + session.duration, 0)
  const totalWeekHours = Math.floor(totalWeekMinutes / 60)
  const remainingMinutes = totalWeekMinutes % 60

  // Group sessions by subject
  const sessionsBySubject = studySessions.reduce((acc, session) => {
    if (!acc[session.subject]) {
      acc[session.subject] = []
    }
    acc[session.subject].push(session)
    return acc
  }, {} as Record<string, StudySession[]>)

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Leora Study Message */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🐆</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#1F1F1F]">{getLeoraStudyMessage()}</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold">Study Tracker</h1>
        <p className="text-muted-foreground mt-1">Track your learning journey with notes and handwriting</p>
      </div>

      {/* Mode Selector */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="quick-log" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Quick Log
          </TabsTrigger>
          <TabsTrigger value="draw-notes" className="gap-2">
            <PenTool className="h-4 w-4" />
            Draw Notes
          </TabsTrigger>
        </TabsList>

        {/* Quick Log Tab */}
        <TabsContent value="quick-log" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Study Session</DialogTitle>
                  <DialogDescription>
                    Record a new study session with details
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      value={newSession.subject}
                      onValueChange={(value) => setNewSession({ ...newSession, subject: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.name}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                              {subject.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      placeholder="What did you study?"
                      value={newSession.topic}
                      onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        placeholder="60"
                        value={newSession.duration}
                        onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newSession.date}
                        onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Key takeaways, questions, etc."
                      value={newSession.notes}
                      onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSession}>Add Session</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalWeekHours}h {remainingMinutes}m
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {thisWeekSessions.length} sessions
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studySessions.length}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Subjects</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(sessionsBySubject).length}</div>
                <p className="text-xs text-muted-foreground mt-1">Different subjects</p>
              </CardContent>
            </Card>
          </div>

          {/* Study Sessions History */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Study Sessions</CardTitle>
              <CardDescription>Your recent study sessions and progress</CardDescription>
            </CardHeader>
            <CardContent>
              {studySessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium">No study sessions yet</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start tracking your learning journey
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studySessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={getSubjectColor(session.subject)}>
                            {session.subject}
                          </Badge>
                          <span className="text-sm font-medium">{session.topic}</span>
                        </div>
                        {session.notes && (
                          <p className="text-sm text-muted-foreground">{session.notes}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.duration} min
                          </span>
                          <span>
                            {new Date(session.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSession(session.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Draw Notes Tab */}
        <TabsContent value="draw-notes" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Free Handwriting Notes</CardTitle>
              <CardDescription>Write naturally with your finger or stylus and save your handwritten notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subject and Topic Selection */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="draw-subject">Subject</Label>
                  <Select value={currentSubject} onValueChange={setCurrentSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                            {subject.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="draw-topic">Topic</Label>
                  <Input
                    id="draw-topic"
                    placeholder="What are you studying?"
                    value={currentTopic}
                    onChange={(e) => setCurrentTopic(e.target.value)}
                  />
                </div>
              </div>

              {/* Drawing Canvas */}
              <DrawingCanvas
                strokes={currentStrokes}
                onStrokesChange={setCurrentStrokes}
              />
              
              {/* Save Button */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStrokes([])}
                  disabled={currentStrokes.length === 0}
                >
                  Clear Canvas
                </Button>
                <Button
                  onClick={handleSaveHandwriting}
                  disabled={currentStrokes.length === 0 || !currentSubject || !currentTopic}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Handwriting
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Study Pages Library */}
          {studyPages.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Saved Study Pages</CardTitle>
                <CardDescription>Your handwritten and converted notes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {studyPages.map((page) => (
                    <Card 
                      key={page.id} 
                      className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => handleOpenStudyPage(page)}
                    >
                      <div className="aspect-[4/3] bg-muted relative">
                        <img
                          src={page.thumbnail || "/placeholder.svg"}
                          alt={page.topic}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteStudyPage(page.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium line-clamp-1">{page.topic}</h3>
                        <Badge variant="secondary" className="mt-2">
                          {page.subject}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(page.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                  })}
                  </p>
                </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default StudyTracker
