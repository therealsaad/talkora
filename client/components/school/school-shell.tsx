'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { authService, AuthSession } from '@/services/auth-service'

interface SchoolShellProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

const navLinks = [
  { href: '/school/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/school/students', label: 'Students', icon: '👥' },
  { href: '/school/classes', label: 'Classes', icon: '🏫' },
  { href: '/school/reports', label: 'Reports & Analytics', icon: '📈' },
  { href: '/school/settings', label: 'Settings', icon: '⚙️' },
]

export function SchoolShell({ children, title, subtitle }: SchoolShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const auth = await authService.getMe()
        if (!auth || (auth.role !== 'SCHOOL_ADMIN' && auth.role !== 'TEACHER')) {
          router.push('/login/school')
          return
        }
        setSession(auth)
      } catch {
        router.push('/login/school')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  function handleLogout() {
    authService.logout()
    router.push('/login/school')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <p style={{ fontWeight: 800, color: '#1e293b' }}>Loading workspace...</p>
      </div>
    )
  }

  const schoolName = session?.school?.name || 'Sunrise Public School'
  const userName = session?.user?.name || (session?.role === 'TEACHER' ? 'Teacher' : 'School Admin')

  return (
    <div className="app-shell" style={{ background: '#f1f5f9', color: '#0f172a', minHeight: '100vh' }}>
      {/* Professional Sidebar */}
      <aside
        className="sidebar"
        style={{
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
          width: '260px',
        }}
      >
        <Link href="/school/dashboard" className="brand" style={{ color: '#0f172a' }}>
          <span className="brand-mark" style={{ background: '#ffd83d', color: '#0f172a', border: '2px solid #0f172a' }}>
            T
          </span>
          <span>talkora</span>
        </Link>

        <span
          className="portal-pill"
          style={{
            background: '#e0f2fe',
            color: '#0369a1',
            border: '1px solid #bae6fd',
            fontWeight: 800,
          }}
        >
          {session?.role === 'TEACHER' ? 'Teacher Workspace' : 'School Admin Portal'}
        </span>

        <nav style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: isActive ? '#0f172a' : '#64748b',
                  background: isActive ? '#f8fafc' : 'transparent',
                  border: isActive ? '1px solid #e2e8f0' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer / Teacher Card */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#ffd83d',
                border: '2px solid #0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '13px',
              }}
            >
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userName}
              </strong>
              <small style={{ color: '#64748b', fontSize: '11px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {schoolName}
              </small>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="main-area" style={{ flex: 1, minWidth: 0, background: '#f8fafc' }}>
        {/* Topbar */}
        <header
          className="topbar"
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '20px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span className="eyebrow" style={{ color: '#64748b', fontWeight: 800 }}>
              {schoolName}
            </span>
            <h1 style={{ fontSize: '24px', color: '#0f172a', margin: '2px 0 0' }}>{title}</h1>
            {subtitle && <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>{subtitle}</p>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span
              style={{
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              🟢 System Active
            </span>
            <Link
              href="/login/student"
              style={{
                background: '#ffd83d',
                color: '#0f172a',
                border: '2px solid #0f172a',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 900,
              }}
            >
              Open Student Portal →
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>{children}</main>
      </div>
    </div>
  )
}
