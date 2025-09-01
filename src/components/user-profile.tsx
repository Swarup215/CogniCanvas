"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  User, 
  Crown, 
  Fire, 
  TrendingUp, 
  Calendar, 
  Award,
  Settings,
  Target,
  BookOpen,
  Star,
  Zap
} from 'lucide-react'
import { AchievementSystem } from '@/components/achievement-system'
import { format } from 'date-fns'

interface UserStats {
  currentStreak: number
  longestStreak: number
  totalNotes: number
  totalSubjects: number
  totalImportantSnippets: number
  totalRevisions: number
  joinDate: string
  lastActive: string
  level: number
  experience: number
  nextLevelExperience: number
}

interface UserProfileProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function UserProfile({ isOpen, onOpenChange }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements'>('overview')

  // Mock user stats - will be replaced with real data
  const userStats: UserStats = {
    currentStreak: 7,
    longestStreak: 15,
    totalNotes: 23,
    totalSubjects: 3,
    totalImportantSnippets: 12,
    totalRevisions: 8,
    joinDate: '2024-01-01',
    lastActive: new Date().toISOString(),
    level: 5,
    experience: 1250,
    nextLevelExperience: 1500
  }

  const getLevelTitle = (level: number) => {
    if (level < 3) return 'Learning Novice'
    if (level < 6) return 'Knowledge Seeker'
    if (level < 10) return 'Study Enthusiast'
    if (level < 15) return 'Master Student'
    if (level < 20) return 'Wisdom Keeper'
    return 'Knowledge Legend'
  }

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'Start your learning journey today!'
    if (streak < 3) return 'You\'re just getting started!'
    if (streak < 7) return 'Keep up the great work!'
    if (streak < 14) return 'You\'re on fire!'
    if (streak < 30) return 'Incredible consistency!'
    return 'You\'re a true legend!'
  }

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onOpenChange(true)}
        className="flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
          U
        </div>
        <span className="hidden sm:inline text-sm font-medium">Profile</span>
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-4xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              U
            </div>
            <div>
              <h2 className="text-xl font-semibold">User Profile</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Member since {format(new Date(userStats.joinDate), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              ×
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
          >
            <User className="h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'achievements' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('achievements')}
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
          >
            <Award className="h-4 w-4" />
            Achievements
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {activeTab === 'overview' ? (
              <div className="space-y-6">
                {/* Level and Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Your Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold">Level {userStats.level}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {getLevelTitle(userStats.level)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {userStats.experience} / {userStats.nextLevelExperience} XP
                        </p>
                        <p className="text-xs text-slate-500">
                          {userStats.nextLevelExperience - userStats.experience} XP to next level
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Streak Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Fire className="h-5 w-5 text-orange-500" />
                      Learning Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-500 mb-1">
                          {userStats.currentStreak}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Current Streak</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {getStreakMessage(userStats.currentStreak)}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-500 mb-1">
                          {userStats.longestStreak}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Longest Streak</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Your personal best!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Activity Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <span className="text-xl font-bold">{userStats.totalNotes}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Notes</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="h-4 w-4 text-purple-500" />
                          <span className="text-xl font-bold">{userStats.totalSubjects}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Subjects</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-xl font-bold">{userStats.totalImportantSnippets}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Important</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Zap className="h-4 w-4 text-green-500" />
                          <span className="text-xl font-bold">{userStats.totalRevisions}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Revisions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-indigo-500" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Completed revision for "Java Inheritance"</span>
                        <span className="text-slate-500 ml-auto">2 hours ago</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Created new note "Polymorphism Concepts"</span>
                        <span className="text-slate-500 ml-auto">1 day ago</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span>Marked 3 snippets as important</span>
                        <span className="text-slate-500 ml-auto">2 days ago</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span>Created new subject "World History"</span>
                        <span className="text-slate-500 ml-auto">3 days ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <AchievementSystem stats={userStats} />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}