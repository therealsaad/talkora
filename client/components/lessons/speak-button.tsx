'use client'

import { useRef, useState } from 'react'

type SpeakState = 'idle' | 'permission-request' | 'ready' | 'recording' | 'processing' | 'success' | 'retry' | 'error'

export function SpeakButton({ phrase, onComplete }: { phrase: string; onComplete?: () => void }) {
  const [state, setState] = useState<SpeakState>('idle')
  const [error, setError] = useState('')
  const recorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Microphone recording is not available in this browser.')
      setState('error')
      return
    }
    setState('permission-request')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunks.current = []
      const mediaRecorder = new MediaRecorder(stream)
      recorder.current = mediaRecorder
      mediaRecorder.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data) }
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        setState('processing')
        window.setTimeout(() => setState('success'), 650)
      }
      mediaRecorder.start()
      setState('recording')
      window.setTimeout(() => { if (mediaRecorder.state === 'recording') mediaRecorder.stop() }, 4000)
    } catch {
      setError('I could not access your microphone. Check permission and try again.')
      setState('error')
    }
  }
  const stop = () => { if (recorder.current?.state === 'recording') recorder.current.stop() }
  const label = { idle: 'Tap to speak', 'permission-request': 'Asking for microphone', ready: 'Ready when you are', recording: 'Listening...', processing: 'Miss Julie is listening...', success: 'Practice captured', retry: 'Try again', error: 'Microphone unavailable' }[state]
  return <div className={`speak-control speak-${state}`}><button className="microphone-button" type="button" onClick={state === 'recording' ? stop : start} disabled={state === 'permission-request' || state === 'processing'} aria-label={`${label}. Say ${phrase}`}><span aria-hidden="true">MIC</span><strong>{label}</strong><small>Say: “{phrase}”</small>{state === 'recording' && <i className="audio-wave" aria-hidden="true"><b /><b /><b /><b /><b /></i>}</button>{state === 'success' && <p className="voice-feedback"><strong>Practice captured.</strong><span>Speech evaluation is not connected yet, so no pronunciation score was invented.</span><button className="world-button" type="button" onClick={() => { setState('retry'); onComplete?.() }}>Continue practice</button></p>}{state === 'error' && <p className="context-feedback gentle"><strong>{error}</strong><button className="world-button" type="button" onClick={() => setState('idle')}>Try microphone again</button></p>}</div>
}
