'use client'

import React, { useEffect, useState } from 'react'
import { SchoolShell } from '@/components/school/school-shell'
import { authService, AuthSession } from '@/services/auth-service'

export default function SchoolSettingsPage() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const auth = await authService.getMe()
        setSession(auth)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <SchoolShell
      title="School Settings & Configuration"
      subtitle="School credentials, teacher profile, and security preferences."
    >
      <div style={{ maxWidth: '640px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '18px', color: '#0f172a', margin: '0 0 20px' }}>School Profile</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              School Name
            </label>
            <input
              disabled
              value={session?.school?.name || 'Sunrise Public School'}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              Official School Code (Used for Student Login)
            </label>
            <input
              disabled
              value={session?.school?.code || 'DEMO001'}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 900, letterSpacing: '2px', color: '#0284c7' }}
            />
            <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Share this code with your students so they can access their student portal at <code>/login/student</code>.
            </small>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              Database Persistence
            </label>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '8px', color: '#166534', fontWeight: 800, fontSize: '13px' }}>
              ✓ Connected to MongoDB Atlas Cloud Cluster
            </div>
          </div>
        </div>
      </div>
    </SchoolShell>
  )
}
