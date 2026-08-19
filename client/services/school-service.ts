import { apiClient } from '@/lib/api-client'

export interface StudentListItem {
  id: string
  fullName: string
  rollNumber: string
  studentCode: string
  grade: number
  className?: string
  avatar?: string
  status: 'active' | 'inactive'
  progress?: {
    accuracy: number
    completedLevels: number
    totalXp: number
    learningTimeMinutes: number
    streak: number
  }
}

export interface StudentDetail extends StudentListItem {
  createdAt: string
  updatedAt: string
  recentAttempts?: Array<{
    activityId: string
    answer: string
    correct: boolean
    timeTakenSeconds: number
    speakingAccuracy?: number
    createdAt: string
  }>
  memories?: Array<{
    category: string
    fact: string
    confidence: number
  }>
  mistakes?: Array<{
    type: string
    target: string
    userInput: string
    frequency: number
  }>
  weakSkills?: string[]
  strongSkills?: string[]
  aiRecommendation?: string
}

export interface SchoolOverview {
  school: {
    id: string
    name: string
    code: string
    location?: string
  }
  studentCount: number
  activeStudentCount: number
  teacherCount: number
  averageProgress: number
  totalLearningMinutes: number
}

export interface AnalyticsOverview {
  totalAttempts: number
  avgAccuracy: number
  totalLearningTimeMinutes: number
  activeTodayCount: number
  gradeBreakdown: Array<{
    grade: number
    studentCount: number
    avgAccuracy: number
    avgLevelsCompleted: number
  }>
}

export const schoolService = {
  async getOverview(): Promise<SchoolOverview> {
    return apiClient<SchoolOverview>('/schools/overview')
  },

  async listStudents(params?: {
    grade?: number
    className?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<{ students: StudentListItem[]; total: number; page: number; limit: number }> {
    const query = new URLSearchParams()
    if (params?.grade) query.set('grade', String(params.grade))
    if (params?.className) query.set('className', params.className)
    if (params?.search) query.set('search', params.search)
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))

    const qs = query.toString()
    return apiClient(`/students${qs ? `?${qs}` : ''}`)
  },

  async getStudent(id: string): Promise<StudentDetail> {
    return apiClient<StudentDetail>(`/students/${id}`)
  },

  async createStudent(data: {
    fullName: string
    rollNumber: string
    grade: number
    className?: string
    studentCode?: string
  }): Promise<StudentListItem> {
    return apiClient<StudentListItem>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateStudent(
    id: string,
    data: {
      fullName?: string
      rollNumber?: string
      grade?: number
      className?: string
      status?: 'active' | 'inactive'
    }
  ): Promise<StudentListItem> {
    return apiClient<StudentListItem>(`/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async deleteStudent(id: string): Promise<{ success: boolean }> {
    return apiClient(`/students/${id}`, {
      method: 'DELETE',
    })
  },

  async resetCode(id: string): Promise<{ studentCode: string }> {
    return apiClient(`/students/${id}/reset-code`, {
      method: 'POST',
    })
  },

  async deactivateStudent(id: string): Promise<{ status: string }> {
    return apiClient(`/students/${id}/deactivate`, {
      method: 'POST',
    })
  },

  async getAnalytics(): Promise<AnalyticsOverview> {
    return apiClient<AnalyticsOverview>('/analytics/overview')
  },

  async getWeakestSkills(): Promise<any> {
    return apiClient('/analytics/weakest-skills')
  },
}
