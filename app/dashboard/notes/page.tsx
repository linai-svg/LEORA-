"use client"

import { useState } from "react"
import { useUserStorage } from "@/hooks/use-user-storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Trash2, Pencil, StickyNote as StickyNoteIcon, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getLeoraNotesMessage } from "@/lib/leora-section-messages"

interface Note {
  id: string
  title: string
  content: string
  color: string
  createdAt: string
  updatedAt: string
}

const noteColors = [
  { name: "Beige", value: "from-amber-50 to-orange-50", border: "border-amber-200", text: "text-amber-900" },
  { name: "Pink", value: "from-pink-50 to-rose-50", border: "border-pink-200", text: "text-pink-900" },
  { name: "Blue", value: "from-blue-50 to-cyan-50", border: "border-blue-200", text: "text-blue-900" },
  { name: "Green", value: "from-green-50 to-emerald-50", border: "border-green-200", text: "text-green-900" },
  { name: "Purple", value: "from-purple-50 to-violet-50", border: "border-purple-200", text: "text-purple-900" },
  { name: "Gray", value: "from-gray-50 to-slate-50", border: "border-gray-200", text: "text-gray-900" },
]

export default function NotesPage() {
  const [notes, setNotes] = useUserStorage<Note[]>("notes", [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNote, setNewNote] = useState({ title: "", content: "", color: noteColors[0].value })
  const { toast } = useToast()

  const handleSaveNote = () => {
    if (!newNote.title || !newNote.content) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your note.",
        variant: "destructive",
      })
      return
    }

    if (editingNote) {
      setNotes(
        notes.map((note) =>
          note.id === editingNote.id
            ? { ...note, ...newNote, updatedAt: new Date().toISOString() }
            : note
        )
      )
      toast({
        title: "Note updated",
        description: "Your note has been updated successfully.",
      })
    } else {
      const note: Note = {
        id: crypto.randomUUID(),
        ...newNote,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setNotes([note, ...notes])
      toast({
        title: "Note created",
        description: "Your note has been saved.",
      })
    }

    resetForm()
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setNewNote({ title: note.title, content: note.content, color: note.color })
    setIsDialogOpen(true)
  }

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
    toast({
      title: "Note deleted",
      description: "Your note has been removed.",
    })
  }

  const resetForm = () => {
    setNewNote({ title: "", content: "", color: noteColors[0].value })
    setEditingNote(null)
    setIsDialogOpen(false)
  }

  const getBorderClass = (colorValue: string) => {
    const color = noteColors.find((c) => c.value === colorValue)
    return color?.border || "border-gray-200"
  }

  const getTextClass = (colorValue: string) => {
    const color = noteColors.find((c) => c.value === colorValue)
    return color?.text || "text-gray-900"
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Leora Notes Message */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🐆</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{getLeoraNotesMessage()}</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-2">Notes</h1>
          <p className="text-muted-foreground">Quick thoughts and reminders</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <Card className="border-2 shadow-soft">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <StickyNoteIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">No notes yet</p>
            <p className="text-sm text-muted-foreground mb-4">Start capturing your thoughts and ideas</p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create your first note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => {
            const colorData = noteColors.find((c) => c.value === note.color) || noteColors[0]
            return (
              <Card
                key={note.id}
                className={`bg-gradient-to-br ${note.color} border-2 ${getBorderClass(note.color)} shadow-soft hover:shadow-lg transition-all cursor-pointer group`}
                onClick={() => handleEditNote(note)}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className={`font-semibold text-lg line-clamp-2 flex-1 ${getTextClass(note.color)}`}>
                      {note.title}
                    </h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditNote(note)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNote(note.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className={`text-sm line-clamp-4 ${getTextClass(note.color)} opacity-80`}>
                    {note.content}
                  </p>
                  <div className={`flex items-center gap-2 text-xs ${getTextClass(note.color)} opacity-60`}>
                    <Clock className="h-3 w-3" />
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Notes Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingNote ? "Edit Note" : "Create New Note"}</DialogTitle>
            <DialogDescription>
              {editingNote ? "Update your note" : "Write down your thoughts"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Note title..."
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Start typing..."
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                rows={8}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-6 gap-3">
                {noteColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setNewNote({ ...newNote, color: color.value })}
                    className={`h-12 rounded-lg border-2 bg-gradient-to-br ${color.value} ${color.border} transition-all hover:scale-105 ${newNote.color === color.value ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSaveNote}>{editingNote ? "Update" : "Create"} Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
