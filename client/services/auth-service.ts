import { apiClient, setStoredToken, setStoredUser, clearStoredToken, getStoredUser } from '@/lib/api-client'

export interface AuthSession {
  token: string
  role: 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT'
  user?: {
    id: string
    name: string
    code?: string
    email?: string
    role: string
  }
  student?: {
    id: string
    fullName: string
    rollNumber: string
    grade: number
    className?: string
    studentCode: string
    avatar?: string
  }
  school?: {
    id: string
    name: string
    code: string
  }
}

export interface StudentProfileOption {
  id: string
  fullName: string
  rollNumber: string
  grade: number
  className?: string
  avatar?: string
}

export const authService = {
  async loginSchool(schoolCode: string, password: string): Promise<AuthSession> {
    const data = await apiClient<{ token: string; school: any }>('/auth/school/login', {
      method: 'POST',
      body: JSON.stringify({ schoolCode, password }),
    })
    setStoredToken(data.token)
    const session: AuthSession = {
      token: data.token,
      role: 'SCHOOL_ADMIN',
      user: { id: data.school.id, name: data.school.name, code: data.school.code, role: 'SCHOOL_ADMIN' },
      school: data.school,
    }
    setStoredUser(session)
    return session
  },

  async loginTeacher(email: string, password: string): Promise<AuthSession> {
    const data = await apiClient<{ token: string; teacher: any; school: any }>('/auth/teacher/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setStoredToken(data.token)
    const session: AuthSession = {
      token: data.token,
      role: 'TEACHER',
      user: { id: data.teacher.id, name: data.teacher.name, email: data.teacher.email, role: 'TEACHER' },
      school: data.school,
    }
    setStoredUser(session)
    return session
  },

  async lookupStudents(schoolCode: string): Promise<{ school: { id: string; name: string; code: string }; students: StudentProfileOption[] }> {
    return apiClient('/auth/student/school', {
      method: 'POST',
      body: JSON.stringify({ schoolCode }),
    })
  },

  async loginStudent(schoolCode: string, studentId: string, studentCode: string): Promise<AuthSession> {
    const data = await apiClient<{ token: string; student: any; school: any }>('/auth/student/login', {
      method: 'POST',
      body: JSON.stringify({ schoolCode, studentId, studentCode }),
    })
    setStoredToken(data.token)
    const session: AuthSession = {
      token: data.token,
      role: 'STUDENT',
      student: data.student,
      school: data.school,
    }
    setStoredUser(session)
    return session
  },

  async getMe(): Promise<AuthSession | null> {
    try {
      const data = await apiClient<{ role: 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT'; student?: any; school?: any; teacher?: any }>('/auth/me')
      const session: AuthSession = {
        token: localStorage.getItem('talkora_token') || '',
        role: data.role,
        student: data.student,
        school: data.school,
        user: data.teacher || data.school,
      }
      setStoredUser(session)
      return session
    } catch {
      return null
    }
  },

  getCurrentSession(): AuthSession | null {
    return getStoredUser()
  },

  logout(): void {
    clearStoredToken()
  },
}
