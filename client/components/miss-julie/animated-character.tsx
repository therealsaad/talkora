"use client"

import { useState } from 'react'
import { speakAsMissJulie } from '@/lib/female-voice'

export function AnimatedMissJulie({ message = 'Ready for your next adventure?' }: { message?: string }) {
  const [mood, setMood] = useState<'idle' | 'excited' | 'talking'>('idle')

  function greet() {
    setMood('talking')
    speakAsMissJulie(message)
    window.setTimeout(() => setMood('excited'), 1200)
    window.setTimeout(() => setMood('idle'), 2400)
  }

  return (
    <button className={`miss-julie-character miss-julie-${mood}`} type="button" onClick={greet} aria-label="Talk to Miss Julie">
      <img src="/miss-julie-portrait.png" alt="Miss Julie, your Talkora English coach" />
      <span className="character-spark spark-one" aria-hidden="true">+</span>
      <span className="character-spark spark-two" aria-hidden="true">+</span>
    </button>
  )
}

export function CartoonCompanions() {
  return <div className="cartoon-companions" aria-hidden="true"><span className="pip">Pip</span><span className="tiko">Tiko</span><span className="bobo">Bobo</span></div>
}
