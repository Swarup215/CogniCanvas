"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Palette } from 'lucide-react'

interface Notebook {
  title: string
  description?: string
  theme: string
}

interface AddNotebookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddNotebook: (notebook: Omit<Notebook, 'id' | 'noteCount' | 'createdAt' | 'updatedAt'>) => void
  subjectColor: string
}

const themeOptions = [
  { name: 'Default', value: 'default', preview: 'bg-gradient-to-br from-slate-100 to-slate-200' },
  { name: 'Blue', value: 'blue', preview: 'bg-gradient-to-br from-blue-100 to-blue-200' },
  { name: 'Green', value: 'green', preview: 'bg-gradient-to-br from-green-100 to-green-200' },
  { name: 'Purple', value: 'purple', preview: 'bg-gradient-to-br from-purple-100 to-purple-200' },
  { name: 'Orange', value: 'orange', preview: 'bg-gradient-to-br from-orange-100 to-orange-200' },
  { name: 'Red', value: 'red', preview: 'bg-gradient-to-br from-red-100 to-red-200' },
  { name: 'Pink', value: 'pink', preview: 'bg-gradient-to-br from-pink-100 to-pink-200' },
  { name: 'Teal', value: 'teal', preview: 'bg-gradient-to-br from-teal-100 to-teal-200' }
]

export function AddNotebookDialog({ open, onOpenChange, onAddNotebook, subjectColor }: AddNotebookDialogProps) {
  const [formData, setFormData] = useState<Notebook>({
    title: '',
    description: '',
    theme: 'default'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title.trim()) {
      onAddNotebook(formData)
      setFormData({
        title: '',
        description: '',
        theme: 'default'
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Create New Notebook
          </DialogTitle>
          <DialogDescription>
            Add a new notebook to organize your notes within this subject.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Notebook Title</Label>
              <Input
                id="title"
                placeholder="e.g., Lecture 1: Intro to OOP, Chapter 5: Integrals"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the notebook..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Theme
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {themeOptions.map((theme) => (
                  <button
                    key={theme.value}
                    type="button"
                    className={`relative rounded-lg border-2 p-3 transition-all ${
                      formData.theme === theme.value 
                        ? 'border-slate-900 dark:border-slate-100 scale-105 shadow-md' 
                        : 'border-transparent hover:border-slate-300'
                    }`}
                    onClick={() => setFormData({ ...formData, theme: theme.value })}
                  >
                    <div className={`h-12 rounded ${theme.preview} mb-2`} />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {theme.name}
                    </span>
                    {formData.theme === theme.value && (
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
              Create Notebook
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}