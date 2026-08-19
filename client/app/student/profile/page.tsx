'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authService, AuthSession } from '@/services/auth-service'

export default function StudentProfilePage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const auth = await authService.getMe()
        if (!auth || auth.role !== 'STUDENT') {
          router.push('/login/student')
          return
        }
        setSession(auth)
      } catch (err) {
        console.error('Failed to load profile', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  function handleLogout() {
    authService.logout()
    router.push('/')
  }

  const student = session?.student
  const initials = student?.fullName
    ? student.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : 'TK'

  return (
    <div className="world-screen world-courtyard" style={{ minHeight: '100vh', paddingBottom: '120px' }}>
      <div className="world-copy">
        <span className="world-kicker">Student Account & Settings</span>
        <h1>Explorer Profile</h1>
        <p>Your Talkora student identity and classroom connection details.</p>
      </div>

      <main style={{ maxWidth: '580px', margin: '30px auto 0' }}>
        <div
          style={{
            background: '#fffaf0',
            border: '4px solid #172554',
            borderRadius: '24px',
            boxShadow: '8px 8px 0 #172554',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: '#ffd83d',
              border: '4px solid #172554',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 900,
              color: '#172554',
              margin: '0 auto 16px',
              boxShadow: '4px 4px 0 #172554',
            }}
          >
            {initials}
          </div>

          <h2 style={{ fontSize: '28px', color: '#172554', margin: '4px 0' }}>{student?.fullName || 'Student Explorer'}</h2>
          <p style={{ color: '#40527d', fontWeight: 800, fontSize: '15px' }}>
            Class {student?.grade || 4}
            {student?.className ? ` (${student.className})` : ''} · Roll No. {student?.rollNumber || '01'}
          </p>

          <div
            style={{
              margin: '24px 0',
              padding: '16px',
              background: '#ffffff',
              border: '2px solid #172554',
              borderRadius: '16px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#40527d', fontWeight: 800 }}>School</span>
              <strong style={{ color: '#172554' }}>{session?.school?.name || 'Sunrise Public School'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#40527d', fontWeight: 800 }}>School Code</span>
              <strong style={{ color: '#172554' }}>{session?.school?.code || 'DEMO001'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#40527d', fontWeight: 800 }}>Secret Student Code</span>
              <strong style={{ color: '#ff7a3d', letterSpacing: '2px' }}>{student?.studentCode || '••••'}</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="button"
            style={{
              background: '#f4b29f',
              color: '#172554',
              border: '3px solid #172554',
              width: '100%',
              padding: '14px',
              fontWeight: 900,
              fontSize: '14px',
            }}
          >
            🚪 Log Out of Talkora
          </button>
        </div>
      </main>

      {/* Floating Bottom Navigation */}
      <nav className="world-nav" aria-label="Student Navigation">
        <Link href="/student/dashboard">Home</Link>
        <Link href="/student/levels">Adventure Map</Link>
        <Link href="/student/classes">Classes</Link>
        <Link href="/student/progress">Progress</Link>
        <Link href="/student/rewards">Rewards</Link>
        <Link className="learn-active" href="/student/profile">Profile</Link>
      </nav>
    </div>
  )
}
