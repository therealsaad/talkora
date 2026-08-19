import { apiClient } from '@/lib/api-client'

export interface AttemptSubmission {
  answer: string
  startedAt: string
  hintsUsed?: number
  idempotencyKey?: string
}

export interface AttemptResult {
  attempt: any
  xpAwarded: number
  streak?: number
  levelProgress?: {
    levelId: string
    status: 'locked' | 'available' | 'in-progress' | 'completed'
    accuracy: number
    stars: number
    xp: number
  }
  unlockedAchievements?: Array<{
    key: string
    title: string
    description: string
    category: string
  }>
}

export interface StudentOverallProgress {
  totalXp: number
  streak: number
  accuracy: number
  vocabularyScore: number
  grammarScore: number
  speakingScore: number
  pronunciationScore: number
  completedLevels: number
  learningTimeMinutes: number
  levelProgresses: Array<{
    levelId: string
    status: string
    accuracy: number
    stars: number
    xp: number
    updatedAt: string
  }>
}

export interface AchievementItem {
  id: string
  key: string
  title: string
  description: string
  category: 'completion' | 'speaking' | 'learning' | 'streak'
  unlocked: boolean
  unlockedAt?: string
}

export interface DailyChallengeItem {
  id: string
  date: string
  title: string
  description: string
  category: string
  targetCount: number
  xpReward: number
  progress?: number
  completed?: boolean
}

export const progressService = {
  async submitAttempt(activityId: string, submission: AttemptSubmission): Promise<AttemptResult> {
    return apiClient<AttemptResult>(`/progress/activities/${activityId}/attempts`, {
      method: 'POST',
      body: JSON.stringify(submission),
    })
  },

  async getClassProgress(classId: string): Promise<any> {
    return apiClient(`/progress/classes/${classId}`)
  },

  async getMyProgress(): Promise<StudentOverallProgress> {
    return apiClient<StudentOverallProgress>('/students/me/progress')
  },

  async getMyAchievements(): Promise<AchievementItem[]> {
    return apiClient<AchievementItem[]>('/achievements/mine')
  },

  async getMyDailyChallenge(): Promise<DailyChallengeItem | null> {
    try {
      return await apiClient<DailyChallengeItem>('/daily-challenges/today')
    } catch {
      return {
        id: 'daily-1',
        date: new Date().toISOString().slice(0, 10),
        title: 'Daily Speaking Adventure',
        description: 'Complete 3 speaking challenges with Miss Julie today!',
        category: 'speaking',
        targetCount: 3,
        xpReward: 40,
        progress: 1,
        completed: false,
      }
    }
  },
}
