"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface TextConversionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recognizedText: string
  onSave: (text: string, action: 'replace' | 'keep-both' | 'discard') => void
  onEdit: (text: string) => void
  isProcessing: boolean
}

function TextConversionDialog({
  open,
  onOpenChange,
  recognizedText,
  onSave,
  onEdit,
  isProcessing,
}: TextConversionDialogProps) {
  const [editedText, setEditedText] = useState(recognizedText)

  // Update edited text when recognized text changes
  useState(() => {
    setEditedText(recognizedText)
  })

  const handleTextChange = (value: string) => {
    setEditedText(value)
    onEdit(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Handwriting Recognition Result</DialogTitle>
          <DialogDescription>
            Review and edit the converted text below. You can correct any errors before saving.
          </DialogDescription>
        </DialogHeader>

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Converting handwriting to text...</p>
            <p className="text-xs text-muted-foreground">This may take a few seconds</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recognized-text">Recognized Text</Label>
              <Textarea
                id="recognized-text"
                value={editedText}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={12}
                placeholder="Recognized text will appear here..."
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Edit the text above to correct any recognition errors.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onSave(editedText, 'discard')}
            disabled={isProcessing}
          >
            Discard Text
          </Button>
          <Button
            variant="outline"
            onClick={() => onSave(editedText, 'keep-both')}
            disabled={isProcessing || !editedText.trim()}
          >
            Keep Both
          </Button>
          <Button
            onClick={() => onSave(editedText, 'replace')}
            disabled={isProcessing || !editedText.trim()}
          >
            Replace with Text
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TextConversionDialog
export { TextConversionDialog }
