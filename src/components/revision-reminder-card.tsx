"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, CheckCircle, BookOpen } from 'lucide-react'
import { format } from 'date-fns'

interface RevisionReminder {
  id: string
  noteTitle: string
  notebookName: string
  scheduledAt: string
  completed: boolean
}

interface RevisionReminderCardProps {
  reminder: RevisionReminder
}

export function RevisionReminderCard({ reminder }: RevisionReminderCardProps) {
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a')
  }

  const isOverdue = new Date(reminder.scheduledAt) < new Date() && !reminder.completed

  return (
    <Card className={`group transition-all duration-200 hover:shadow-md ${
      reminder.completed 
        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
        : isOverdue 
          ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' 
          : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
    }`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {reminder.completed ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Calendar className="h-4 w-4 text-blue-600" />
              )}
              <span className={`text-xs font-medium ${
                reminder.completed 
                  ? 'text-green-600 dark:text-green-400' 
                  : isOverdue 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-blue-600 dark:text-blue-400'
              }`}>
                {reminder.completed ? 'Completed' : isOverdue ? 'Overdue' : 'Scheduled'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              <span>{formatTime(reminder.scheduledAt)}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <h4 className={`text-sm font-medium ${
              reminder.completed 
                ? 'text-green-800 dark:text-green-200 line-through' 
                : 'text-slate-800 dark:text-slate-200'
            }`}>
              {reminder.noteTitle}
            </h4>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <BookOpen className="h-3 w-3 mr-1" />
                {reminder.notebookName}
              </Badge>
            </div>
          </div>
          
          {!reminder.completed && (
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs h-7"
              >
                Start Revision
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}