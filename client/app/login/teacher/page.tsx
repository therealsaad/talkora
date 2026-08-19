'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthFrame } from '@/components/auth/auth-frame'
import { authService } from '@/services/auth-service'

export default function TeacherLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('teacher@demo.talkora.dev')
  const [password, setPassword] = useState('teacher123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.loginTeacher(email.trim(), password)
      router.push('/school/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid teacher credentials. Please check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame
      title="Empower every student to speak English."
      subtitle="Track learning paths, observe speaking growth, and support your classroom."
      pose="teaching"
      badgeText="Teacher Portal"
    >
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">Teacher Workspace</span>
        <h2>Welcome, Teacher!</h2>
        <p>Sign in to view your classes and student progress.</p>

        <label>
          Teacher Email
          <input
            required
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teacher@school.org"
          />
        </label>

        <label>
          Password
          <div className="input-with-action">
            <input
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <button className="button button-dark wide" disabled={loading} type="submit">
          {loading ? 'Signing in...' : 'Login as Teacher'}
        </button>

        <div className="demo-hint" style={{ fontSize: '12px', marginTop: '4px' }}>
          <span>Demo Credentials: <strong>teacher@demo.talkora.dev</strong> / <strong>teacher123</strong></span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '13px' }}>
          <Link className="back-link" href="/login/school">School Login →</Link>
          <Link className="back-link" href="/login/student">Student Login →</Link>
        </div>
      </form>
    </AuthFrame>
  )
}
