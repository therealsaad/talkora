import { apiClient } from '@/lib/api-client'

export interface MissJulieAIResponse {
  message: string
  emotion: 'welcome' | 'encouraging' | 'thinking' | 'celebrating' | 'concerned'
  evaluation?: {
    correct: boolean
    score: number
    feedback: string
  }
  corrections?: string[]
  hint?: string | null
  xpAwarded?: number
  recommendation?: string | null
}

export interface AIRecommendation {
  nextAction: string
  suggestedLevelId?: string
  focusSkill?: string
  rationale?: string
  message: string
}

export const aiService = {
  async askMissJulie(params: {
    message: string
    activityId?: string
    lessonId?: string
    context?: 'lesson_instruction' | 'activity_feedback' | 'hint' | 'mistake_correction' | 'encouragement' | 'speaking' | 'pronunciation' | 'review' | 'level_completion' | 'recommendation' | 'general'
  }): Promise<MissJulieAIResponse> {
    const data = await apiClient<MissJulieAIResponse>('/ai/miss-julie', {
      method: 'POST',
      body: JSON.stringify(params),
    })
    return data
  },

  async getRecommendation(): Promise<AIRecommendation> {
    const data = await apiClient<{ recommendations: string[] }>('/ai/recommendation')
    const message = data.recommendations[0] || 'Keep going — try the next lesson in your current level!'
    return { nextAction: 'Continue your current lesson', message }
  },
}
