"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  Award,
  Crown,
  Fire,
  CheckCircle,
  Lock
} from 'lucide-react'
import { format } from 'date-fns'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'streak' | 'content' | 'engagement' | 'mastery'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  unlockedAt?: string
  progress: number
  maxProgress: number
  reward?: string
}

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

interface AchievementSystemProps {
  stats: UserStats
  onAchievementUnlock?: (achievement: Achievement) => void
}

export function AchievementSystem({ stats, onAchievementUnlock }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'streak' | 'content' | 'engagement' | 'mastery'>('all')
  const [showUnlocked, setShowUnlocked] = useState(false)

  useEffect(() => {
    // Generate achievements based on user stats
    const generatedAchievements: Achievement[] = [
      // Streak Achievements
      {
        id: 'streak_3',
        title: 'Getting Started',
        description: 'Maintain a 3-day streak',
        icon: '🔥',
        category: 'streak',
        rarity: 'common',
        unlocked: stats.currentStreak >= 3,
        unlockedAt: stats.currentStreak >= 3 ? stats.lastActive : undefined,
        progress: Math.min(stats.currentStreak, 3),
        maxProgress: 3
      },
      {
        id: 'streak_7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🗓️',
        category: 'streak',
        rarity: 'rare',
        unlocked: stats.currentStreak >= 7,
        unlockedAt: stats.currentStreak >= 7 ? stats.lastActive : undefined,
        progress: Math.min(stats.currentStreak, 7),
        maxProgress: 7
      },
      {
        id: 'streak_30',
        title: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        icon: '🌙',
        category: 'streak',
        rarity: 'epic',
        unlocked: stats.currentStreak >= 30,
        unlockedAt: stats.currentStreak >= 30 ? stats.lastActive : undefined,
        progress: Math.min(stats.currentStreak, 30),
        maxProgress: 30
      },
      {
        id: 'streak_100',
        title: 'Century Club',
        description: 'Maintain a 100-day streak',
        icon: '💯',
        category: 'streak',
        rarity: 'legendary',
        unlocked: stats.currentStreak >= 100,
        unlockedAt: stats.currentStreak >= 100 ? stats.lastActive : undefined,
        progress: Math.min(stats.currentStreak, 100),
        maxProgress: 100
      },

      // Content Achievements
      {
        id: 'content_10_notes',
        title: 'Note Taker',
        description: 'Create 10 notes',
        icon: '📝',
        category: 'content',
        rarity: 'common',
        unlocked: stats.totalNotes >= 10,
        progress: Math.min(stats.totalNotes, 10),
        maxProgress: 10
      },
      {
        id: 'content_50_notes',
        title: 'Prolific Writer',
        description: 'Create 50 notes',
        icon: '📚',
        category: 'content',
        rarity: 'rare',
        unlocked: stats.totalNotes >= 50,
        progress: Math.min(stats.totalNotes, 50),
        maxProgress: 50
      },
      {
        id: 'content_5_subjects',
        title: 'Subject Expert',
        description: 'Create 5 subjects',
        icon: '🎓',
        category: 'content',
        rarity: 'rare',
        unlocked: stats.totalSubjects >= 5,
        progress: Math.min(stats.totalSubjects, 5),
        maxProgress: 5
      },

      // Engagement Achievements
      {
        id: 'engagement_10_important',
        title: 'Highlight Master',
        description: 'Mark 10 snippets as important',
        icon: '⭐',
        category: 'engagement',
        rarity: 'common',
        unlocked: stats.totalImportantSnippets >= 10,
        progress: Math.min(stats.totalImportantSnippets, 10),
        maxProgress: 10
      },
      {
        id: 'engagement_5_revisions',
        title: 'Revision Regular',
        description: 'Complete 5 revision sessions',
        icon: '🔄',
        category: 'engagement',
        rarity: 'common',
        unlocked: stats.totalRevisions >= 5,
        progress: Math.min(stats.totalRevisions, 5),
        maxProgress: 5
      },

      // Mastery Achievements
      {
        id: 'mastery_first_subject',
        title: 'Subject Pioneer',
        description: 'Create your first subject',
        icon: '🚀',
        category: 'mastery',
        rarity: 'common',
        unlocked: stats.totalSubjects >= 1,
        progress: Math.min(stats.totalSubjects, 1),
        maxProgress: 1
      },
      {
        id: 'mastery_first_note',
        title: 'Note Creator',
        description: 'Create your first note',
        icon: '✨',
        category: 'mastery',
        rarity: 'common',
        unlocked: stats.totalNotes >= 1,
        progress: Math.min(stats.totalNotes, 1),
        maxProgress: 1
      }
    ]

    setAchievements(generatedAchievements)
  }, [stats])

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory
    const unlockedMatch = !showUnlocked || achievement.unlocked
    return categoryMatch && unlockedMatch
  })

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
      case 'rare':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      case 'epic':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
      case 'legendary':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'streak':
        return <Fire className="h-4 w-4" />
      case 'content':
        return <BookOpen className="h-4 w-4" />
      case 'engagement':
        return <Star className="h-4 w-4" />
      case 'mastery':
        return <Trophy className="h-4 w-4" />
      default:
        return <Award className="h-4 w-4" />
    }
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  return (
    <div className="space-y-6">
      {/* User Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Fire className="h-4 w-4 text-orange-500" />
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.currentStreak}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Day Streak</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.level}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Level</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.totalNotes}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Notes</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="h-4 w-4 text-purple-500" />
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {unlockedCount}/{totalCount}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Achievements</p>
            </div>
          </div>
          
          {/* Experience Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Level {stats.level}</span>
              <span>{stats.experience}/{stats.nextLevelExperience} XP</span>
            </div>
            <Progress 
              value={(stats.experience / stats.nextLevelExperience) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Achievement Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </div>
            <Badge variant="secondary">
              {unlockedCount}/{totalCount} Unlocked
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            <Button
              variant={selectedCategory === 'streak' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('streak')}
              className="flex items-center gap-1"
            >
              <Fire className="h-3 w-3" />
              Streak
            </Button>
            <Button
              variant={selectedCategory === 'content' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('content')}
              className="flex items-center gap-1"
            >
              <BookOpen className="h-3 w-3" />
              Content
            </Button>
            <Button
              variant={selectedCategory === 'engagement' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('engagement')}
              className="flex items-center gap-1"
            >
              <Star className="h-3 w-3" />
              Engagement
            </Button>
            <Button
              variant={selectedCategory === 'mastery' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('mastery')}
              className="flex items-center gap-1"
            >
              <Trophy className="h-3 w-3" />
              Mastery
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showUnlocked"
              checked={showUnlocked}
              onChange={(e) => setShowUnlocked(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="showUnlocked" className="text-sm">
              Show unlocked only
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Achievement List */}
      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`transition-all duration-200 ${
                achievement.unlocked 
                  ? 'shadow-md border-l-4 border-l-yellow-400' 
                  : 'opacity-60'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                      achievement.unlocked 
                        ? getRarityColor(achievement.rarity)
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {achievement.unlocked ? achievement.icon : <Lock className="h-6 w-6" />}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-medium ${
                        achievement.unlocked 
                          ? 'text-slate-900 dark:text-slate-100' 
                          : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {achievement.title}
                      </h3>
                      
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(achievement.category)}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRarityColor(achievement.rarity)}`}
                        >
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {achievement.description}
                    </p>
                    
                    {/* Progress Bar */}
                    {achievement.progress < achievement.maxProgress && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                    
                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-2">
                        <CheckCircle className="h-3 w-3" />
                        <span>
                          Unlocked {format(new Date(achievement.unlockedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}