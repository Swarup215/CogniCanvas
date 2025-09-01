"use client"

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, ExternalLink, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface ImportantSnippet {
  id: string
  content: string
  subjectName: string
  notebookName: string
  createdAt: string
  notebookId: string
}

interface ImportantSnippetCardProps {
  snippet: ImportantSnippet
}

export function ImportantSnippetCard({ snippet }: ImportantSnippetCardProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d')
  }

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <Link href={`/notebook/${snippet.notebookId}`} className="no-underline">
      <Card className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 h-full">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                  Important
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                <span>{formatDate(snippet.createdAt)}</span>
              </div>
            </div>
            
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {truncateContent(snippet.content)}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {snippet.subjectName}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {snippet.notebookName}
                </Badge>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}