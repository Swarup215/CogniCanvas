"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Keyboard, Command, AlertCircle } from 'lucide-react'

interface KeyboardShortcutsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { key: 'Alt + H', description: 'Go to dashboard' },
      { key: 'Esc', description: 'Close modal/dialog' },
    ]
  },
  {
    category: 'Actions',
    items: [
      { key: 'Ctrl + N', description: 'Create new subject' },
      { key: '/', description: 'Focus search' },
    ]
  },
  {
    category: 'Quick Access',
    items: [
      { key: 'Alt + U', description: 'Open user profile' },
      { key: 'Alt + B', description: 'Open notifications' },
    ]
  },
  {
    category: 'Help',
    items: [
      { key: 'Ctrl + ?', description: 'Show this help' },
    ]
  }
]

export function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Navigate and use CogniCanvas more efficiently with these keyboard shortcuts.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {shortcut.description}
                    </span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {shortcut.key.split(' + ').map((part, index) => (
                        <span key={index}>
                          {part === 'Ctrl' ? (
                            <Command className="inline h-3 w-3 mx-0.5" />
                          ) : part === 'Alt' ? (
                            <span className="mx-0.5">⌥</span>
                          ) : part === 'Shift' ? (
                            <span className="mx-0.5">⇧</span>
                          ) : (
                            <span className="mx-0.5">{part}</span>
                          )}
                        </span>
                      ))}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Pro Tip</p>
              <p>
                Shortcuts work anywhere in the app, except when typing in text fields. 
                Press Ctrl + ? anytime to see this help dialog.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}