const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export class ApiError extends Error {
  code: string
  status: number
  details?: any

  constructor(message: string, code = 'API_ERROR', status = 500, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('talkora_token')
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('talkora_token', token)
  window.dispatchEvent(new Event('talkora_auth_change'))
}

export function clearStoredToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('talkora_token')
  localStorage.removeItem('talkora_user')
  window.dispatchEvent(new Event('talkora_auth_change'))
}

export function getStoredUser(): any | null {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem('talkora_user')
  try {
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: any): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('talkora_user', JSON.stringify(user))
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    })

    const data: ApiResponse<T> = await res.json().catch(() => ({
      success: false,
      error: { code: 'INVALID_JSON', message: 'Received non-JSON response from server' },
    }))

    if (!res.ok || !data.success) {
      const errorMsg = data.error?.message || `Request failed with status ${res.status}`
      const errorCode = data.error?.code || 'REQUEST_FAILED'
      throw new ApiError(errorMsg, errorCode, res.status, data.error?.details)
    }

    return data.data as T
  } catch (err: any) {
    if (err instanceof ApiError) throw err
    throw new ApiError(err.message || 'Network error occurred', 'NETWORK_ERROR', 0)
  }
}
