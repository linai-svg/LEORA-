"use client"

import { useState, useEffect } from "react"
import { useUserStorage } from "@/hooks/use-user-storage"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Target, Trophy, Trash2, CheckCircle2, Edit, Archive, BookOpen, Heart, User, Sparkles, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Goal, GoalStep } from "@/types"
import { getLeoraGoalsMessage } from "@/lib/leora-section-messages"

const goalCategories = [
  { value: "study", label: "Study", icon: BookOpen, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "health", label: "Health", icon: Heart, color: "bg-green-100 text-green-700 border-green-200" },
  { value: "personal", label: "Personal", icon: User, color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "other", label: "Other", icon: Sparkles, color: "bg-gray-100 text-gray-700 border-gray-200" },
]

const priorityLevels = [
  { value: "low", label: "Low", color: "text-muted-foreground", variant: "secondary" as const },
  { value: "medium", label: "Medium", color: "text-orange-600", variant: "outline" as const },
  { value: "high", label: "High", color: "text-red-600", variant: "destructive" as const },
]

export default function GoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals] = useUserStorage<Goal[]>("goals", [])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [mascotAchievement, setMascotAchievement] = useState<string | null>(null)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    type: "monthly" as "monthly" | "yearly",
    category: "personal" as Goal["category"],
    priority: "medium" as Goal["priority"],
    deadline: "",
  })
  const { toast } = useToast()
  const [newSteps, setNewSteps] = useState<{ [key: string]: string }>({})

  // No automatic progress calculation - goals are marked completed manually

  const handleAddGoal = () => {
    if (!newGoal.title) {
      toast({ title: "Missing title", description: "Please provide a title for your goal.", variant: "destructive" })
      return
    }
    if (!newGoal.deadline) {
      toast({ title: "Missing deadline", description: "Please set a deadline for your goal.", variant: "destructive" })
      return
    }

    const deadlineDate = new Date(newGoal.deadline)
    const goal: Goal = {
      id: crypto.randomUUID(),
      userId: user?.id || "guest",
      ...newGoal,
      targetMonth: newGoal.type === "monthly" ? deadlineDate.getMonth() + 1 : undefined,
      targetYear: deadlineDate.getFullYear(),
      completed: false,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [],
    }

    setGoals([goal, ...goals])
    setNewGoal({ title: "", description: "", type: "monthly", category: "personal", priority: "medium", deadline: "" })
    setIsCreateDialogOpen(false)
    
    toast({ title: "Goal created", description: "Your goal has been added successfully." })
  }

  const handleEditGoal = () => {
    if (!editingGoal) return
    
    setGoals(goals.map(g => g.id === editingGoal.id ? { ...editingGoal, updatedAt: new Date().toISOString() } : g))
    setIsEditDialogOpen(false)
    setEditingGoal(null)
    
    toast({ title: "Goal updated", description: "Your changes have been saved." })
  }

  const toggleStepComplete = (goalId: string, stepId: string) => {
    setGoals(goals.map(goal => {
      if (goal.id !== goalId) return goal
      
      const updatedSteps = goal.steps.map(step => 
        step.id === stepId
          ? { ...step, completed: !step.completed, completedAt: !step.completed ? new Date().toISOString() : undefined }
          : step
      )
      
      const completedCount = updatedSteps.filter(s => s.completed).length
      const progress = updatedSteps.length > 0 ? Math.round((completedCount / updatedSteps.length) * 100) : 0
      
      // Check for milestones
      const prevProgress = goal.progress
      if (progress === 50 && prevProgress < 50) {
        toast({ title: "Halfway there!", description: "You're doing amazing! 50% complete!" })
      } else if (progress === 100 && prevProgress < 100) {
        toast({ title: "Goal achieved!", description: "Congratulations! You completed this goal!" })
      } else if (progress === 25 && prevProgress < 25) {
        toast({ title: "Great start!", description: "You're making excellent progress!" })
      }
      
      return {
        ...goal,
        steps: updatedSteps,
        progress,
        completed: progress === 100,
        completedAt: progress === 100 ? new Date().toISOString() : goal.completedAt,
        updatedAt: new Date().toISOString(),
      }
    }))
  }

  const addStep = (goalId: string, stepTitle: string) => {
    if (!stepTitle.trim()) return

    const step: GoalStep = {
      id: crypto.randomUUID(),
      title: stepTitle,
      completed: false,
    }

    setGoals(goals.map(g => 
      g.id === goalId ? { ...g, steps: [...g.steps, step], updatedAt: new Date().toISOString() } : g
    ))
    setNewSteps({ ...newSteps, [goalId]: "" })
    
    toast({ title: "Step added", description: "New step has been added to your goal." })
  }
      
  const deleteStep = (goalId: string, stepId: string) => {
    setGoals(goals.map(goal => {
      if (goal.id !== goalId) return goal
      return { ...goal, steps: goal.steps.filter(s => s.id !== stepId), updatedAt: new Date().toISOString() }
    }))
  }

  const archiveGoal = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, archived: true, updatedAt: new Date().toISOString() } : g))
    toast({ title: "Goal archived", description: "Goal moved to archive." })
  }

  const restoreGoal = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, archived: false, updatedAt: new Date().toISOString() } : g))
    toast({ title: "Goal restored", description: "Goal restored from archive." })
  }

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id))
    setDeleteConfirmId(null)
    toast({ title: "Goal deleted", description: "Your goal has been permanently removed." })
  }

  const toggleGoalComplete = (goalId: string) => {
    setGoals(goals.map(goal => {
      if (goal.id !== goalId) return goal
      
      return {
        ...goal,
        completed: !goal.completed,
        completedAt: !goal.completed ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      }
    }))
  }

  const monthlyGoals = goals.filter((g) => g.type === "monthly" && !g.completed && !g.archived)
  const yearlyGoals = goals.filter((g) => g.type === "yearly" && !g.completed && !g.archived)
  const completedGoals = goals.filter((g) => g.completed && !g.archived)
  const archivedGoals = goals.filter((g) => g.archived)

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const category = goalCategories.find(c => c.value === goal.category)!
    const CategoryIcon = category.icon
    const priorityBorder = goal.priority === "high" ? "border-l-4 border-l-red-500" : goal.priority === "medium" ? "border-l-4 border-l-orange-400" : ""
    
    return (
      <Card className={`shadow-soft group ${priorityBorder} border-2 hover:shadow-lg transition-shadow`}>
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={category.color}>
                <CategoryIcon className="h-3 w-3 mr-1" />
                {category.label}
              </Badge>
              {goal.priority !== "low" && (
                <Badge variant={priorityLevels.find(p => p.value === goal.priority)!.variant}>
                  {goal.priority}
                </Badge>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => { setEditingGoal(goal); setIsEditDialogOpen(true) }}>
                <Edit className="h-4 w-4" />
              </Button>
              {!goal.archived && !goal.completed && (
                <Button variant="ghost" size="icon" onClick={() => archiveGoal(goal.id)}>
                  <Archive className="h-4 w-4" />
                </Button>
              )}
              {goal.archived && (
                <Button variant="ghost" size="icon" onClick={() => restoreGoal(goal.id)}>
                  <Archive className="h-4 w-4 text-primary" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(goal.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
          <CardTitle className="text-base">{goal.title}</CardTitle>
          {goal.description && <CardDescription className="mt-1">{goal.description}</CardDescription>}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <Calendar className="h-3 w-3" />
            <span>Deadline: {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Complete Goal Button */}
          {!goal.archived && (
            <Button
              variant={goal.completed ? "outline" : "default"}
              className="w-full"
              onClick={() => toggleGoalComplete(goal.id)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {goal.completed ? "Mark Incomplete" : "Mark Complete"}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Leora Goals Message */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 rounded-xl p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🐆</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{getLeoraGoalsMessage()}</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-2">Goals</h1>
          <p className="text-muted-foreground">Track and achieve your monthly and yearly goals</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>Set a new goal to track and achieve</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Goal Type</Label>
                  <Select value={newGoal.type} onValueChange={(value: "monthly" | "yearly") => setNewGoal({ ...newGoal, type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Goal</SelectItem>
                      <SelectItem value="yearly">Yearly Goal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newGoal.category} onValueChange={(value: Goal["category"]) => setNewGoal({ ...newGoal, category: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {goalCategories.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newGoal.priority} onValueChange={(value: Goal["priority"]) => setNewGoal({ ...newGoal, priority: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {priorityLevels.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input id="deadline" type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input id="title" placeholder="E.g. Read 12 books" value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea id="description" placeholder="Add more details about your goal..." value={newGoal.description} onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddGoal}>Create Goal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Monthly Goals</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{monthlyGoals.length}</div><p className="text-xs text-muted-foreground">active</p></CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Yearly Goals</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{yearlyGoals.length}</div><p className="text-xs text-muted-foreground">active</p></CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Completed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{completedGoals.length}</div><p className="text-xs text-muted-foreground">achieved</p></CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Average Progress</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{monthlyGoals.length > 0 ? Math.round(monthlyGoals.reduce((sum, g) => sum + g.progress, 0) / monthlyGoals.length) : 0}%</div><p className="text-xs text-muted-foreground">monthly goals</p></CardContent>
        </Card>
      </div>

      {/* Goals Tabs */}
      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          {monthlyGoals.length === 0 ? (
            <Card className="shadow-soft"><CardContent className="flex flex-col items-center justify-center py-12 text-center"><Target className="h-12 w-12 text-muted-foreground/50 mb-3" /><p className="text-muted-foreground">No monthly goals yet</p><Button variant="link" className="mt-2" onClick={() => setIsCreateDialogOpen(true)}>Create your first monthly goal</Button></CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">{monthlyGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}</div>
          )}
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4">
          {yearlyGoals.length === 0 ? (
            <Card className="shadow-soft"><CardContent className="flex flex-col items-center justify-center py-12 text-center"><Target className="h-12 w-12 text-muted-foreground/50 mb-3" /><p className="text-muted-foreground">No yearly goals yet</p><Button variant="link" className="mt-2" onClick={() => setIsCreateDialogOpen(true)}>Create your first yearly goal</Button></CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">{yearlyGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}</div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedGoals.length === 0 ? (
            <Card className="shadow-soft"><CardContent className="flex flex-col items-center justify-center py-12 text-center"><Trophy className="h-12 w-12 text-muted-foreground/50 mb-3" /><p className="text-muted-foreground">No completed goals yet</p></CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">{completedGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}</div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          {archivedGoals.length === 0 ? (
            <Card className="shadow-soft"><CardContent className="flex flex-col items-center justify-center py-12 text-center"><Archive className="h-12 w-12 text-muted-foreground/50 mb-3" /><p className="text-muted-foreground">No archived goals</p></CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">{archivedGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {editingGoal && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Goal</DialogTitle>
              <DialogDescription>Update your goal details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Title</Label><Input value={editingGoal.title} onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={editingGoal.description} onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })} rows={3} /></div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Category</Label><Select value={editingGoal.category} onValueChange={(value: Goal["category"]) => setEditingGoal({ ...editingGoal, category: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{goalCategories.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Priority</Label><Select value={editingGoal.priority} onValueChange={(value: Goal["priority"]) => setEditingGoal({ ...editingGoal, priority: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{priorityLevels.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="space-y-2"><Label>Deadline</Label><Input type="date" value={editingGoal.deadline.split('T')[0]} onChange={(e) => setEditingGoal({ ...editingGoal, deadline: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingGoal(null); }}>Cancel</Button>
              <Button onClick={handleEditGoal}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this goal. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirmId && deleteGoal(deleteConfirmId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
