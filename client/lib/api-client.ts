const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://talkora-s-backend-production.up.railway.app/api/v1'

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

  const res = await fetch(url, {
    ...options,
    headers,
  })

  const data: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    error: {
      code: 'INVALID_JSON',
      message: 'Received non-JSON response from server',
    },
  }))

  if (!res.ok || !data.success) {
    throw new ApiError(
      data.error?.message || `Request failed with status ${res.status}`,
      data.error?.code || 'REQUEST_FAILED',
      res.status,
      data.error?.details
    )
  }

  return data.data as T
}