"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  Clock, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  AlertCircle,
  X,
  Settings,
  Filter
} from 'lucide-react'
import { format } from 'date-fns'

interface Notification {
  id: string
  type: 'revision_reminder' | 'inactivity_nudge' | 'achievement' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionable?: boolean
  actionUrl?: string
  priority: 'low' | 'medium' | 'high'
}

interface NotificationSystemProps {
  onNotificationClick?: (notification: Notification) => void
}

export function NotificationSystem({ onNotificationClick }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'revision' | 'system'>('all')

  useEffect(() => {
    // Mock notifications - will be replaced with real data
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'revision_reminder',
        title: 'Revision Reminder',
        message: 'Time to review "Java Inheritance" in Lecture 2: Advanced OOP',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        read: false,
        actionable: true,
        actionUrl: '/notes/3',
        priority: 'high'
      },
      {
        id: '2',
        type: 'inactivity_nudge',
        title: 'Feeling distant?',
        message: 'It\'s been 2 weeks since you last visited your Calculus notes. Maybe it\'s time for a review?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: false,
        actionable: true,
        actionUrl: '/subjects/2',
        priority: 'medium'
      },
      {
        id: '3',
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: 'You\'ve maintained a 7-day streak! Keep up the great work!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true,
        priority: 'low'
      },
      {
        id: '4',
        type: 'revision_reminder',
        title: 'Upcoming Revision',
        message: 'Schedule for "Integration Rules" is tomorrow at 2:00 PM',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        read: true,
        actionable: true,
        actionUrl: '/notes/4',
        priority: 'medium'
      },
      {
        id: '5',
        type: 'system',
        title: 'Welcome to CogniCanvas!',
        message: 'Start creating subjects and notebooks to organize your learning journey.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        read: true,
        priority: 'low'
      }
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
  }, [])

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    )
    setNotifications(updatedNotifications)
    setUnreadCount(updatedNotifications.filter(n => !n.read).length)
  }

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }))
    setNotifications(updatedNotifications)
    setUnreadCount(0)
  }

  const removeNotification = (id: string) => {
    const updatedNotifications = notifications.filter(notification => notification.id !== id)
    setNotifications(updatedNotifications)
    setUnreadCount(updatedNotifications.filter(n => !n.read).length)
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.read
    if (filter === 'revision') return notification.type === 'revision_reminder'
    if (filter === 'system') return notification.type === 'system' || notification.type === 'inactivity_nudge'
    return true
  })

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'revision_reminder':
        return <Calendar className="h-4 w-4" />
      case 'inactivity_nudge':
        return <Clock className="h-4 w-4" />
      case 'achievement':
        return <CheckCircle className="h-4 w-4" />
      case 'system':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950'
      case 'medium':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950'
      case 'low':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950'
      default:
        return 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return format(time, 'MMM d')
  }

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative p-2"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-5"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <div className="flex gap-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'revision', label: 'Revision' },
                { key: 'system', label: 'System' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={filter === key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(key as typeof filter)}
                  className="text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  No notifications found
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-all duration-200 cursor-pointer hover:shadow-md ${
                    getNotificationColor(notification.priority)
                  } ${!notification.read ? 'shadow-sm' : ''}`}
                  onClick={() => {
                    if (notification.actionable && onNotificationClick) {
                      onNotificationClick(notification)
                    }
                    markAsRead(notification.id)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`text-sm font-medium ${
                            !notification.read ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {notification.title}
                          </h3>
                          
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-xs text-slate-500">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-auto w-auto opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeNotification(notification.id)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {notification.message}
                        </p>
                        
                        {notification.actionable && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Click to view
                            </Badge>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" size="sm" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Notification Settings
          </Button>
        </div>
      </div>
    </div>
  )
}