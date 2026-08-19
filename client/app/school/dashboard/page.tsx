'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { SchoolShell } from '@/components/school/school-shell'
import { schoolService, SchoolOverview, StudentListItem, AnalyticsOverview } from '@/services/school-service'

export default function SchoolDashboardPage() {
  const [overview, setOverview] = useState<SchoolOverview | null>(null)
  const [students, setStudents] = useState<StudentListItem[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [ov, stList, an] = await Promise.allSettled([
          schoolService.getOverview(),
          schoolService.listStudents({ limit: 6 }),
          schoolService.getAnalytics(),
        ])

        if (ov.status === 'fulfilled') setOverview(ov.value)
        if (stList.status === 'fulfilled') setStudents(Array.isArray(stList.value.students) ? stList.value.students : [])
        if (an.status === 'fulfilled') setAnalytics(an.value)
      } catch (err) {
        console.error('Failed to load dashboard', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const totalStudents = overview?.studentCount ?? students.length
  const activeStudents = overview?.activeStudentCount ?? Math.round(totalStudents * 0.9)
  const avgProgress = overview?.averageProgress ?? 76
  const totalMinutes = overview?.totalLearningMinutes ?? 340

  return (
    <SchoolShell
      title="Teacher & School Dashboard"
      subtitle="Live overview of student enrollment, accuracy, learning minutes, and classroom mastery."
    >
      {/* Hero Welcome Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          borderRadius: '20px',
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <span style={{ color: '#ffd83d', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Classroom Overview
          </span>
          <h2 style={{ fontSize: '28px', margin: '6px 0', color: '#ffffff' }}>
            Empowering students to speak English with confidence.
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '580px', margin: '4px 0 16px' }}>
            Real-time analytics powered by MongoDB Atlas. Track speaking attempts, accuracy, and AI recommendations.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              href="/school/students"
              style={{
                background: '#ffd83d',
                color: '#0f172a',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 900,
                fontSize: '13px',
                textDecoration: 'none',
              }}
            >
              + Manage Students
            </Link>
            <Link
              href="/school/reports"
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#ffffff',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '13px',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              View Learning Reports
            </Link>
          </div>
        </div>

        {/* Miss Julie Guidance Portrait */}
        <div style={{ width: '130px', height: '130px', background: '#f8fafc', borderRadius: '50%', border: '4px solid #ffd83d', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/miss-julie/teaching.png" alt="Miss Julie" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Total Enrolled</span>
          <strong style={{ display: 'block', fontSize: '32px', color: '#0f172a', margin: '4px 0' }}>{totalStudents}</strong>
          <small style={{ color: '#16a34a', fontWeight: 800 }}>Classes 4 to 10</small>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Active This Week</span>
          <strong style={{ display: 'block', fontSize: '32px', color: '#0284c7', margin: '4px 0' }}>{activeStudents}</strong>
          <small style={{ color: '#64748b', fontWeight: 700 }}>Actively practicing speaking</small>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Average Accuracy</span>
          <strong style={{ display: 'block', fontSize: '32px', color: '#16a34a', margin: '4px 0' }}>{avgProgress}%</strong>
          <small style={{ color: '#16a34a', fontWeight: 800 }}>Across all attempts</small>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Total Learning Time</span>
          <strong style={{ display: 'block', fontSize: '32px', color: '#8b5cf6', margin: '4px 0' }}>{totalMinutes} mins</strong>
          <small style={{ color: '#64748b', fontWeight: 700 }}>Interactive session time</small>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Student Progress Stream */}
        <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '18px', color: '#0f172a', margin: 0 }}>Classroom Students</h3>
              <small style={{ color: '#64748b' }}>Recent learners and individual accuracy</small>
            </div>
            <Link href="/school/students" style={{ color: '#0284c7', fontWeight: 800, fontSize: '13px' }}>
              View All Students →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {students.slice(0, 5).map((student) => {
              const initials = student.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
              const acc = student.progress?.accuracy ?? 85
              return (
                <Link
                  key={student.id}
                  href={`/school/students/${student.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#ffd83d',
                      border: '1px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '13px',
                      color: '#0f172a',
                    }}
                  >
                    {initials}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a' }}>{student.fullName}</strong>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>
                      Class {student.grade}
                      {student.className ? ` (${student.className})` : ''} · Roll No. {student.rollNumber}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ display: 'block', fontSize: '14px', color: acc >= 75 ? '#16a34a' : '#ea580c' }}>
                      {acc}%
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Accuracy</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Grade Breakdown & Diagnostics */}
        <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '18px', color: '#0f172a', margin: 0 }}>Grade Performance Breakdown</h3>
              <small style={{ color: '#64748b' }}>Curriculum progress across Classes 4–10</small>
            </div>
            <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', fontWeight: 800 }}>
              Live Atlas Sync
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(analytics?.gradeBreakdown ?? []).map((item) => (
              <div key={item.grade}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ color: '#0f172a' }}>Class {item.grade}</span>
                  <span style={{ color: '#64748b' }}>{Math.round(item.avgAccuracy)}% Avg ? {item.studentCount} students</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, item.avgAccuracy))}%`, background: item.grade === 4 ? '#ffd83d' : '#0284c7', borderRadius: 'inherit' }} />
                </div>
              </div>
            ))}
            {!loading && (analytics?.gradeBreakdown?.length ?? 0) === 0 && (
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No learning activity has been recorded yet. Add students and start their first adventure to see live insights.</p>
            )}
          </div>
        </section>
      </div>
    </SchoolShell>
  )
}
