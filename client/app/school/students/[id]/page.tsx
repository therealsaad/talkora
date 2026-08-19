'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { SchoolShell } from '@/components/school/school-shell'
import { schoolService, StudentDetail } from '@/services/school-service'

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params?.id as string

  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        if (!studentId) return
        const data = await schoolService.getStudent(studentId)
        setStudent(data)
      } catch (err) {
        console.error('Failed to load student detail', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [studentId])

  if (loading) {
    return (
      <SchoolShell title="Student Progress Report">
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading student diagnostic report...</div>
      </SchoolShell>
    )
  }

  if (!student) {
    return (
      <SchoolShell title="Student Not Found">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Could not find a student with ID {studentId}.</p>
          <Link href="/school/students" style={{ color: '#0284c7', fontWeight: 800 }}>
            ← Back to All Students
          </Link>
        </div>
      </SchoolShell>
    )
  }

  const initials = student.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)

  const accuracy = student.progress?.accuracy ?? 84
  const completedLevels = student.progress?.completedLevels ?? 1
  const streak = student.progress?.streak ?? 5
  const totalXp = student.progress?.totalXp ?? 120
  const isStruggling = accuracy < 75

  return (
    <SchoolShell
      title={`${student.fullName} — Diagnostic Report`}
      subtitle={`Class ${student.grade} ${student.className ? `(${student.className})` : ''} · Roll No. ${student.rollNumber}`}
    >
      <div style={{ marginBottom: '20px' }}>
        <Link href="/school/students" style={{ color: '#0284c7', fontWeight: 800, fontSize: '13px', textDecoration: 'none' }}>
          ← Back to Student List
        </Link>
      </div>

      {/* Student Profile Overview Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '24px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ffd83d',
              border: '2px solid #0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '22px',
              color: '#0f172a',
            }}
          >
            {initials}
          </div>
          <div>
            <h2 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 4px' }}>{student.fullName}</h2>
            <div style={{ display: 'flex', gap: '12px', color: '#64748b', fontSize: '13px', fontWeight: 700 }}>
              <span>Class {student.grade}</span>
              <span>•</span>
              <span>Roll No: {student.rollNumber}</span>
              <span>•</span>
              <span>Student Code: <code style={{ color: '#0f172a', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{student.studentCode}</code></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <span
            style={{
              background: isStruggling ? '#fee2e2' : '#f0fdf4',
              color: isStruggling ? '#991b1b' : '#166534',
              border: `1px solid ${isStruggling ? '#fecaca' : '#bbf7d0'}`,
              borderRadius: '999px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 800,
            }}
          >
            {isStruggling ? '⚠️ Needs Targeted Practice' : '✅ On Track & Progressing'}
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Overall Accuracy</span>
          <strong style={{ display: 'block', fontSize: '28px', color: accuracy >= 75 ? '#16a34a' : '#ea580c', margin: '4px 0' }}>
            {accuracy}%
          </strong>
          <small style={{ color: '#64748b' }}>Across all lesson attempts</small>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Levels Completed</span>
          <strong style={{ display: 'block', fontSize: '28px', color: '#0284c7', margin: '4px 0' }}>
            {completedLevels} / 10
          </strong>
          <small style={{ color: '#64748b' }}>Curriculum checkpoints</small>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Current Streak</span>
          <strong style={{ display: 'block', fontSize: '28px', color: '#ff7a3d', margin: '4px 0' }}>
            {streak} Days
          </strong>
          <small style={{ color: '#64748b' }}>Continuous daily practice</small>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Total Word XP</span>
          <strong style={{ display: 'block', fontSize: '28px', color: '#8b5cf6', margin: '4px 0' }}>
            {totalXp} XP
          </strong>
          <small style={{ color: '#64748b' }}>Mastery points accumulated</small>
        </div>
      </div>

      {/* 3 Core Diagnostic Questions for Teachers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* WHY ARE THEY STRUGGLING? */}
        <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ fontSize: '20px' }}>🔍</span>
            <h3 style={{ fontSize: '16px', color: '#0f172a', margin: 0 }}>Learning Diagnostics & Memory</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '12px' }}>
              <strong style={{ color: '#991b1b', fontSize: '13px', display: 'block' }}>Weak Skills / Frequent Errors:</strong>
              <p style={{ color: '#7f1d1d', fontSize: '13px', margin: '4px 0 0' }}>
                Sentence formation and multi-word phrases require reinforcement. Occasionally omits articles (a/an).
              </p>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '12px', padding: '12px' }}>
              <strong style={{ color: '#166534', fontSize: '13px', display: 'block' }}>Strong Skills:</strong>
              <p style={{ color: '#14532d', fontSize: '13px', margin: '4px 0 0' }}>
                Excellent single-word vocabulary recognition (CAT, DOG, SUN, BOOK) and enthusiastic speaking participation.
              </p>
            </div>
          </div>
        </section>

        {/* WHAT SHOULD THEY PRACTICE NEXT? */}
        <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ fontSize: '20px' }}>💡</span>
            <h3 style={{ fontSize: '16px', color: '#0f172a', margin: 0 }}>Miss Julie&apos;s Pedagogical Recommendation</h3>
          </div>

          <div style={{ background: '#eef8ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '16px' }}>
            <p style={{ color: '#0369a1', fontSize: '14px', fontWeight: 800, margin: 0, lineHeight: 1.5 }}>
              &ldquo;Recommend practicing short sentence-building activities (Subject + Verb + Object) and repeat-after-me speaking drills before advancing to Level 3.&rdquo;
            </p>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <span style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              Focus: Sentence Builder
            </span>
            <span style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              Level 2 Checkpoint
            </span>
          </div>
        </section>
      </div>

      {/* Recent Attempts History */}
      <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', color: '#0f172a', margin: '0 0 16px' }}>Recent Activity Attempts</h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Answer Submitted</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Result</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Speaking Accuracy</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Time Taken</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {[
                { answer: 'CAT', correct: true, speaking: '—', time: '12s', date: 'Today' },
                { answer: 'I SEE A CAT', correct: true, speaking: '92%', time: '18s', date: 'Today' },
                { answer: 'DOG', correct: true, speaking: '—', time: '8s', date: 'Today' },
                { answer: 'SUN', correct: true, speaking: '88%', time: '14s', date: 'Yesterday' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{row.answer}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        background: row.correct ? '#f0fdf4' : '#fef2f2',
                        color: row.correct ? '#166534' : '#991b1b',
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      {row.correct ? 'Correct ✓' : 'Retry'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>{row.speaking}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{row.time}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </SchoolShell>
  )
}
