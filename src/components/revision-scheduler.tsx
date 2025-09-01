"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Bell, Brain, Target } from 'lucide-react'
import { format } from 'date-fns'

interface RevisionSchedule {
  id: string
  scheduledAt: string
  completed: boolean
  noteId: string
  notebookId: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface Note {
  id: string
  title: string
  notebookName: string
  subjectName: string
  lastStudied?: string
  studyCount: number
}

interface RevisionSchedulerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note: Note
  onSchedule: (scheduledAt: Date) => void
}

const smartSuggestions = [
  { label: 'Tomorrow', days: 1, description: 'Quick review to reinforce learning' },
  { label: 'In 3 days', days: 3, description: 'Optimal for memory retention' },
  { label: 'In 1 week', days: 7, description: 'Weekly review session' },
  { label: 'In 2 weeks', days: 14, description: 'Bi-weekly consolidation' },
  { label: 'In 1 month', days: 30, description: 'Monthly comprehensive review' }
]

export function RevisionScheduler({ open, onOpenChange, note, onSchedule }: RevisionSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [customDate, setCustomDate] = useState(false)

  useEffect(() => {
    if (open) {
      // Set default to tomorrow at 10:00 AM
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)
      
      setSelectedDate(tomorrow.toISOString().split('T')[0])
      setSelectedTime('10:00')
    }
  }, [open])

  const handleSmartSuggestion = (days: number) => {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + days)
    targetDate.setHours(10, 0, 0, 0)
    
    setSelectedDate(targetDate.toISOString().split('T')[0])
    setSelectedTime('10:00')
    setCustomDate(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedDate && selectedTime) {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`)
      onSchedule(scheduledAt)
      onOpenChange(false)
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, MMMM d, yyyy')
  }

  const formatTime = (timeString: string) => {
    return format(new Date(`2000-01-01T${timeString}`), 'h:mm a')
  }

  const getSmartSuggestion = () => {
    if (note.studyCount === 0) {
      return { label: 'First Review', days: 1, description: 'Review within 24 hours for best retention' }
    } else if (note.studyCount === 1) {
      return { label: 'Second Review', days: 3, description: 'Reinforce after 3 days' }
    } else if (note.studyCount < 5) {
      return { label: 'Regular Review', days: 7, description: 'Weekly review schedule' }
    } else {
      return { label: 'Master Review', days: 14, description: 'Bi-weekly for mastery' }
    }
  }

  const smartSuggestion = getSmartSuggestion()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Schedule Revision
          </DialogTitle>
          <DialogDescription>
            Plan your revision session for "{note.title}" to optimize memory retention.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Smart Suggestion */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                AI Recommendation
              </span>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
              {smartSuggestion.description}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSmartSuggestion(smartSuggestion.days)}
              className="text-purple-700 border-purple-300 hover:bg-purple-100 dark:text-purple-300 dark:border-purple-700 dark:hover:bg-purple-900"
            >
              Schedule for {smartSuggestion.label}
            </Button>
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Schedule Options</Label>
            <div className="grid grid-cols-2 gap-2">
              {smartSuggestions.map((suggestion) => (
                <Button
                  key={suggestion.days}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSmartSuggestion(suggestion.days)}
                  className="text-xs h-auto p-3 flex flex-col items-start"
                >
                  <span className="font-medium">{suggestion.label}</span>
                  <span className="text-slate-500 dark:text-slate-400 mt-1">
                    {suggestion.description}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date/Time */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="custom"
                checked={customDate}
                onChange={(e) => setCustomDate(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="custom" className="text-sm font-medium">
                Set custom date and time
              </Label>
            </div>

            {customDate && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Schedule Preview */}
          {(selectedDate || !customDate) && (
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Scheduled For
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedDate ? formatDate(selectedDate) : smartSuggestion.label}
                </p>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>{selectedTime ? formatTime(selectedTime) : '10:00 AM'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Study Stats */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              <span>Studied {note.studyCount} times</span>
            </div>
            {note.lastStudied && (
              <span>Last studied {format(new Date(note.lastStudied), 'MMM d')}</span>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
            >
              <Bell className="h-4 w-4 mr-2" />
              Schedule Revision
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}