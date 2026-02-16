"use client"

import { useState } from "react"
import { useUserStorage } from "@/hooks/use-user-storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, Plus, Trash2, Clock, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getLeoraAgendaMessage } from "@/lib/leora-section-messages"

interface AgendaItem {
  id: string
  title: string
  date: string
  time?: string
  completed: boolean
  createdAt: string
}

export default function AgendaPage() {
  const [agendaItems, setAgendaItems] = useUserStorage<AgendaItem[]>("agenda", [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState({ title: "", date: "", time: "" })
  const { toast } = useToast()

  const getWeekDates = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const monday = new Date(today.setDate(diff))
    
    const week = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      week.push(date)
    }
    return week
  }

  const weekDates = getWeekDates()
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const handleAddItem = () => {
    if (!newItem.title || !newItem.date) {
      toast({
        title: "Missing information",
        description: "Please provide a title and date for your task.",
        variant: "destructive",
      })
      return
    }

    const item: AgendaItem = {
      id: crypto.randomUUID(),
      title: newItem.title,
      date: newItem.date,
      time: newItem.time || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setAgendaItems([...agendaItems, item])
    setNewItem({ title: "", date: "", time: "" })
    setIsDialogOpen(false)
    
    toast({
      title: "Task added",
      description: "Your task has been added to the agenda.",
    })
  }

  const toggleComplete = (id: string) => {
    setAgendaItems(
      agendaItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const deleteItem = (id: string) => {
    setAgendaItems(agendaItems.filter((item) => item.id !== id))
    toast({
      title: "Task deleted",
      description: "Your task has been removed from the agenda.",
    })
  }

  const getItemsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return agendaItems
      .filter((item) => item.date === dateString)
      .sort((a, b) => {
        if (!a.time) return 1
        if (!b.time) return -1
        return a.time.localeCompare(b.time)
      })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const weekStats = {
    total: weekDates.reduce((sum, date) => sum + getItemsForDate(date).length, 0),
    completed: weekDates.reduce((sum, date) => 
      sum + getItemsForDate(date).filter(item => item.completed).length, 0
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Leora Agenda Message */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🐆</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{getLeoraAgendaMessage()}</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-2">Weekly Agenda</h1>
          <p className="text-muted-foreground">Plan and organize your week</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Week Stats */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="border-2 shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{weekStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Total tasks</p>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{weekStats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {weekDates.map((date, index) => {
          const items = getItemsForDate(date)
          const dayName = weekDays[index]
          const dayNumber = date.getDate()
          const isTodayDate = isToday(date)
          
          return (
            <Card
              key={date.toISOString()}
              className={`border-2 shadow-soft ${isTodayDate ? 'border-primary bg-primary/5' : ''}`}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col items-center">
                  <div className={`text-xs font-medium ${isTodayDate ? 'text-primary' : 'text-muted-foreground'}`}>
                    {dayName}
                  </div>
                  <div className={`text-2xl font-bold mt-1 ${isTodayDate ? 'text-primary' : ''}`}>
                    {dayNumber}
                  </div>
                  {items.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {items.filter(i => i.completed).length}/{items.length}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.length === 0 ? (
                  <div className="text-center py-4 text-xs text-muted-foreground">
                    No tasks
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className={`group flex items-start gap-2 p-2 rounded-lg border transition-all ${item.completed ? 'bg-muted/50' : 'bg-background hover:bg-muted/30'}`}
                    >
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleComplete(item.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                          {item.title}
                        </p>
                        {item.time && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{item.time}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Add a task to your weekly agenda</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task</Label>
              <Input
                id="task-title"
                placeholder="What do you need to do?"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-date">Date</Label>
                <Input
                  id="task-date"
                  type="date"
                  value={newItem.date}
                  onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-time">Time (optional)</Label>
                <Input
                  id="task-time"
                  type="time"
                  value={newItem.time}
                  onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddItem}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
