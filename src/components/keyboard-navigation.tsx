"use client"

import { useEffect, useCallback } from 'react'
import { toast } from 'sonner'

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description: string
}

export function useKeyboardNavigation(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when user is typing in an input, textarea, or contenteditable
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = !!shortcut.ctrl === (event.ctrlKey || event.metaKey)
      const shiftMatch = !!shortcut.shift === event.shiftKey
      const altMatch = !!shortcut.alt === event.altKey

      return keyMatch && ctrlMatch && shiftMatch && altMatch
    })

    if (matchingShortcut) {
      event.preventDefault()
      matchingShortcut.action()
    }
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}

interface KeyboardNavigationProps {
  children: React.ReactNode
}

export function KeyboardNavigation({ children }: KeyboardNavigationProps) {
  const shortcuts: Shortcut[] = [
    {
      key: 'n',
      ctrl: true,
      action: () => {
        // Trigger new subject creation
        const addButton = document.querySelector('button:has(.lucide-plus)')
        if (addButton instanceof HTMLButtonElement) {
          addButton.click()
        }
      },
      description: 'Create new subject'
    },
    {
      key: '/',
      action: () => {
        // Focus search input
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      },
      description: 'Focus search'
    },
    {
      key: 'h',
      alt: true,
      action: () => {
        // Go home
        window.location.href = '/'
      },
      description: 'Go to dashboard'
    },
    {
      key: 'u',
      alt: true,
      action: () => {
        // Open user profile
        const profileButton = document.querySelector('button:has(.lucide-user)') as HTMLButtonElement
        if (profileButton) {
          profileButton.click()
        }
      },
      description: 'Open user profile'
    },
    {
      key: 'b',
      alt: true,
      action: () => {
        // Open notifications
        const notificationButton = document.querySelector('button:has(.lucide-bell)') as HTMLButtonElement
        if (notificationButton) {
          notificationButton.click()
        }
      },
      description: 'Open notifications'
    },
    {
      key: 'Escape',
      action: () => {
        // Close modals and dialogs
        const closeButton = document.querySelector('[role="dialog"] button:has(.lucide-x)') as HTMLButtonElement
        if (closeButton) {
          closeButton.click()
        }
      },
      description: 'Close modal/dialog'
    }
  ]

  useKeyboardNavigation(shortcuts)

  // Show keyboard shortcuts help
  useEffect(() => {
    const handleHelp = (event: KeyboardEvent) => {
      if (event.key === '?' && event.ctrlKey) {
        event.preventDefault()
        const shortcutsList = shortcuts.map(s => 
          `${s.ctrl ? 'Ctrl+' : ''}${s.alt ? 'Alt+' : ''}${s.shift ? 'Shift+' : ''}${s.key.toUpperCase()} - ${s.description}`
        ).join('\n')
        
        toast.info('Keyboard Shortcuts:\n' + shortcutsList, {
          duration: 5000,
          style: {
            whiteSpace: 'pre-line',
            fontFamily: 'monospace'
          }
        })
      }
    }

    document.addEventListener('keydown', handleHelp)
    return () => {
      document.removeEventListener('keydown', handleHelp)
    }
  }, [shortcuts])

  return <>{children}</>
}