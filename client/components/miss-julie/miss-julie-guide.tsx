'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { authService } from '@/services/auth-service'
import { findFemaleEnglishVoice } from '@/lib/female-voice'

export type JulieState = 'idle' | 'speaking' | 'listening' | 'thinking' | 'correcting' | 'celebrating'

type MissJulieGuideProps = {
  context: 'home' | 'level' | 'lesson' | 'complete'
  destination?: string
  message?: string
  compact?: boolean
}

const defaultMessages: Record<MissJulieGuideProps['context'], (name: string, destination?: string) => string> = {
  home: (name) => `Hi ${name}! Welcome back to Talkora. How are you today? Ready for another English adventure?`,
  level: (name, destination) => `Hi ${name}! Today we are visiting ${destination || 'a new world'}. I will guide you all the way.`,
  lesson: (name, destination) => `Hi ${name}! Let us begin ${destination || 'this lesson'}. Listen carefully, then you can try with me.`,
  complete: (name) => `Fantastic work, ${name}! You practised bravely and earned new stars today.`,
}

/** A browser-speech guide that degrades gracefully when autoplay is restricted. */
export function MissJulieGuide({ context, destination, message, compact = false }: MissJulieGuideProps) {
  const [name, setName] = useState('Explorer')
  const [state, setState] = useState<JulieState>('idle')
  const [queued, setQueued] = useState(false)
  const hasSpoken = useRef(false)
  const utterance = useRef<SpeechSynthesisUtterance | null>(null)
  const text = message || defaultMessages[context](name, destination)

  const speak = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
    window.speechSynthesis.cancel()
    const next = new SpeechSynthesisUtterance(text)
    next.lang = 'en-US'
    next.rate = 0.88
    next.pitch = 1.18
    next.volume = 1
    const voice = findFemaleEnglishVoice()
    if (voice) next.voice = voice
    next.onstart = () => { setState('speaking'); setQueued(false) }
    next.onend = () => setState('idle')
    next.onerror = () => { setState('idle'); setQueued(true) }
    utterance.current = next
    window.speechSynthesis.speak(next)
    hasSpoken.current = true
    return true
  }, [text])

  useEffect(() => {
    authService.getMe().then((session) => {
      const firstName = session?.student?.fullName?.trim().split(/\s+/)[0]
      if (firstName) setName(firstName)
    }).catch(() => undefined)
  }, [])

  useEffect(() => {
    // Let the greeting use the authenticated name before attempting speech.
    const timer = window.setTimeout(() => {
      if (!speak()) setQueued(true)
    }, 550)
    return () => {
      window.clearTimeout(timer)
      if (utterance.current) window.speechSynthesis?.cancel()
    }
  }, [speak])

  useEffect(() => {
    if (!queued) return
    const onFirstInteraction = () => {
      if (!hasSpoken.current || queued) speak()
      window.removeEventListener('pointerdown', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
    }
    window.addEventListener('pointerdown', onFirstInteraction, { once: true })
    window.addEventListener('keydown', onFirstInteraction, { once: true })
    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
    }
  }, [queued, speak])

  return (
    <aside className={`julie-guide julie-${state} ${compact ? 'julie-guide-compact' : ''}`} aria-live="polite">
      <button className="julie-avatar" type="button" onClick={speak} aria-label="Hear Miss Julie again">
        <img src={`/miss-julie/${state === 'speaking' ? 'teaching' : state === 'thinking' ? 'thinking' : 'welcome'}.png`} alt="Miss Julie, your English guide" />
        {state === 'speaking' && <span className="julie-sound" aria-hidden="true"><i /><i /><i /><i /></span>}
      </button>
      <div className="julie-bubble">
        <span className="julie-label">Miss Julie · {state === 'speaking' ? 'speaking' : 'your guide'}</span>
        <p>{text}</p>
        {queued && <small>Your greeting will begin when you next tap anywhere.</small>}
      </div>
    </aside>
  )
}
