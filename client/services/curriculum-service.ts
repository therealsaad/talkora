import { apiClient } from '@/lib/api-client'

type MongoDocument = { id?: string; _id?: string }

/**
 * API documents are backed by MongoDB and therefore arrive with `_id`.
 * UI routing deliberately uses `id`; normalize that boundary once instead of
 * allowing `/classes/undefined/levels` style requests throughout the app.
 */
function withId<T extends MongoDocument>(item: T): T & { id: string } {
  return { ...item, id: item.id || item._id || '' }
}

export interface CurriculumClass {
  id: string
  grade: number
  name: string
  order: number
}

export interface LevelItem {
  id: string
  classId: string
  number: number
  order: number
  title: string
  place: string
  description: string
  status: 'locked' | 'available' | 'in-progress' | 'completed'
  stars?: number
  lessonCount?: number
}

export interface LessonItem {
  id: string
  levelId: string
  order: number
  title: string
  subtitle?: string
  estimatedMinutes: number
  xpReward: number
  activityCount?: number
}

export interface ActivityItem {
  id: string
  lessonId: string
  order: number
  type: 'WORD_RECOGNITION' | 'PICTURE_CHOICE' | 'LISTENING' | 'MATCHING' | 'SPELLING' | 'LISTEN_AND_REPEAT' | 'SENTENCE_BUILDER' | 'SPEAKING' | 'REVIEW' | 'FILL_BLANK' | string
  title: string
  prompt: string
  instruction?: string
  target: string
  choices?: string[]
  answer?: string
  hint?: string
  difficulty: 'easy' | 'medium' | 'hard'
  xp: number
  estimatedSeconds: number
  voiceEnabled: boolean
  aiEnabled: boolean
}

export const curriculumService = {
  async getClasses(): Promise<CurriculumClass[]> {
    const items = await apiClient<CurriculumClass[]>('/classes')
    return items.map(withId)
  },

  async getClass(id: string): Promise<CurriculumClass> {
    return withId(await apiClient<CurriculumClass>(`/classes/${id}`))
  },

  async getLevels(classId: string): Promise<LevelItem[]> {
    const items = await apiClient<LevelItem[]>(`/classes/${classId}/levels`)
    return items.map(withId)
  },

  async getLevel(id: string): Promise<LevelItem> {
    return withId(await apiClient<LevelItem>(`/levels/${id}`))
  },

  async getLessons(levelId: string): Promise<LessonItem[]> {
    const items = await apiClient<LessonItem[]>(`/levels/${levelId}/lessons`)
    return items.map(withId)
  },

  async getLesson(id: string): Promise<LessonItem> {
    return withId(await apiClient<LessonItem>(`/lessons/${id}`))
  },

  async getActivities(lessonId: string): Promise<ActivityItem[]> {
    const items = await apiClient<ActivityItem[]>(`/lessons/${lessonId}/activities`)
    return items.map(withId)
  },

  async getActivity(id: string): Promise<ActivityItem> {
    return withId(await apiClient<ActivityItem>(`/activities/${id}`))
  },
}
