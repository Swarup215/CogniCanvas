"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { FileText, Palette } from 'lucide-react'

interface Note {
  title: string
  content: string
  background: string
}

interface AddNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'importantSnippetCount'>) => void
  subjectColor: string
}

const backgroundOptions = [
  { name: 'Default', value: 'default', preview: 'bg-white dark:bg-slate-800' },
  { name: 'Parchment', value: 'parchment', preview: 'bg-amber-50 dark:bg-amber-950' },
  { name: 'Blue Gradient', value: 'gradient', preview: 'bg-gradient-to-br from-blue-50 to-purple-50' },
  { name: 'Green', value: 'green', preview: 'bg-green-50 dark:bg-green-950' },
  { name: 'Pink', value: 'pink', preview: 'bg-pink-50 dark:bg-pink-950' },
  { name: 'Teal', value: 'teal', preview: 'bg-teal-50 dark:bg-teal-950' }
]

export function AddNoteDialog({ open, onOpenChange, onAddNote, subjectColor }: AddNoteDialogProps) {
  const [formData, setFormData] = useState<Note>({
    title: '',
    content: '',
    background: 'default'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title.trim()) {
      onAddNote(formData)
      setFormData({
        title: '',
        content: '',
        background: 'default'
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Note
          </DialogTitle>
          <DialogDescription>
            Create a new note to start documenting your knowledge.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Note Title</Label>
              <Input
                id="title"
                placeholder="e.g., Object-Oriented Programming Basics, Calculus Fundamentals"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Initial Content (Optional)</Label>
              <Textarea
                id="content"
                placeholder="Start writing your note content..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Background
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {backgroundOptions.map((background) => (
                  <button
                    key={background.value}
                    type="button"
                    className={`relative rounded-lg border-2 p-3 transition-all ${
                      formData.background === background.value 
                        ? 'border-slate-900 dark:border-slate-100 scale-105 shadow-md' 
                        : 'border-transparent hover:border-slate-300'
                    }`}
                    onClick={() => setFormData({ ...formData, background: background.value })}
                  >
                    <div className={`h-12 rounded ${background.preview} mb-2 border`} />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {background.name}
                    </span>
                    {formData.background === background.value && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.title.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Create Note
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}