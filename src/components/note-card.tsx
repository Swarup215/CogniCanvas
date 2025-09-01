"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Calendar, Clock, Star, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

interface Note {
  id: string
  title: string
  content: string
  background: string
  createdAt: string
  updatedAt: string
  importantSnippetCount: number
}

interface NoteCardProps {
  note: Note
  subjectColor: string
}

const backgroundStyles = {
  default: 'bg-white dark:bg-slate-800',
  parchment: 'bg-amber-50 dark:bg-amber-950',
  gradient: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950',
  green: 'bg-green-50 dark:bg-green-950',
  pink: 'bg-pink-50 dark:bg-pink-950',
  teal: 'bg-teal-50 dark:bg-teal-950',
}

export function NoteCard({ note, subjectColor }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy')
  }

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const backgroundStyle = backgroundStyles[note.background as keyof typeof backgroundStyles] || backgroundStyles.default

  return (
    <Card className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${backgroundStyle}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {note.title}
            </CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {truncateContent(note.content)}
            </CardDescription>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(note.createdAt)}</span>
              </div>
            </div>
            
            {note.importantSnippetCount > 0 && (
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <span>{note.importantSnippetCount}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              <span>Updated {formatDate(note.updatedAt)}</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: subjectColor }}
            >
              Open
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}