import { apiClient } from '@/lib/api-client'
import { findFemaleEnglishVoice } from '@/lib/female-voice'

export interface VoiceEvaluationResult {
  score: number
  errors: string[]
  feedback: string
  available: boolean
}

export interface VoiceSessionData {
  _id: string
  evaluation?: VoiceEvaluationResult
}

export const voiceService = {
  async startSession(params: { lessonId?: string; activityId?: string }): Promise<VoiceSessionData> {
    return apiClient<VoiceSessionData>('/voice/sessions', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },

  async submitTranscript(sessionId: string, transcript: string, expected: string): Promise<VoiceSessionData> {
    return apiClient<VoiceSessionData>(`/voice/sessions/${sessionId}/transcript`, {
      method: 'POST',
      body: JSON.stringify({ transcript, expected }),
    })
  },

  async synthesize(text: string): Promise<{ text: string; audioUrl?: string; fallback: boolean }> {
    return apiClient<{ text: string; audioUrl?: string; fallback: boolean }>('/voice/synthesize', {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
  },

  speakText(text: string, onEnd?: () => void): void {
    if (typeof window === 'undefined') return

    // Cancel any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.pitch = 1.18
      utterance.volume = 1
      const femaleVoice = findFemaleEnglishVoice()

      if (femaleVoice) {
        utterance.voice = femaleVoice
      }

      if (onEnd) {
        utterance.onend = () => onEnd()
        utterance.onerror = () => onEnd()
      }

      window.speechSynthesis.speak(utterance)
    }
  },

  stopSpeaking(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  },
}
