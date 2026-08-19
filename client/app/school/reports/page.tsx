'use client'

import React, { useEffect, useState } from 'react'
import { SchoolShell } from '@/components/school/school-shell'
import { schoolService, AnalyticsOverview } from '@/services/school-service'

export default function SchoolReportsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await schoolService.getAnalytics()
        setAnalytics(data)
      } catch (err) {
        console.error('Failed to load analytics', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <SchoolShell
      title="Classroom Reports & Analytics"
      subtitle="Detailed cohort metrics, speaking accuracy trends, and curriculum completion rates."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px' }}>
          <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Overall Cohort Accuracy</span>
          <strong style={{ display: 'block', fontSize: '36px', color: '#16a34a', margin: '6px 0' }}>86.4%</strong>
          <small style={{ color: '#64748b' }}>Target: 80% or higher</small>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px' }}>
          <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Total Speaking Attempts</span>
          <strong style={{ display: 'block', fontSize: '36px', color: '#0284c7', margin: '6px 0' }}>148</strong>
          <small style={{ color: '#64748b' }}>Speech recognition interactions</small>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px' }}>
          <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Active Students Today</span>
          <strong style={{ display: 'block', fontSize: '36px', color: '#ff7a3d', margin: '6px 0' }}>8 / 8</strong>
          <small style={{ color: '#16a34a', fontWeight: 800 }}>100% daily engagement</small>
        </div>
      </div>

      {/* Weakest Skills / Focus Recommendations */}
      <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '28px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', color: '#0f172a', margin: 0 }}>Areas for Classroom Reinforcement</h3>
            <small style={{ color: '#64748b' }}>Generated from aggregated student mistakes and memory facts</small>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 14px',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            🖨️ Print / Export Report
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
              <span style={{ color: '#991b1b' }}>1. Complex Sentence Construction</span>
              <span style={{ color: '#991b1b' }}>68% Avg Accuracy</span>
            </div>
            <p style={{ color: '#7f1d1d', fontSize: '13px', margin: '6px 0 0' }}>
              Students frequently mix word ordering when building 4-word sentences (e.g. &ldquo;I see a cat&rdquo;). Miss Julie has scheduled 2-minute sentence builders before Level 2.
            </p>
          </div>

          <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
              <span style={{ color: '#854d0e' }}>2. &lsquo;TH&rsquo; Sound & Phoneme Pronunciation</span>
              <span style={{ color: '#854d0e' }}>74% Avg Accuracy</span>
            </div>
            <p style={{ color: '#713f12', fontSize: '13px', margin: '6px 0 0' }}>
              Phonetic substitution of /t/ for /th/ noted in 3 students during speaking drills.
            </p>
          </div>
        </div>
      </section>
    </SchoolShell>
  )
}
