'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { progressService, StudentOverallProgress } from '@/services/progress-service'
import { authService, AuthSession } from '@/services/auth-service'
import { aiService, AIRecommendation } from '@/services/ai-service'

export default function StudentProgressPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [progress, setProgress] = useState<StudentOverallProgress | null>(null)
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null)
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

        try {
          const p = await progressService.getMyProgress()
          setProgress(p)
        } catch (e) {
          console.warn('Failed to load progress', e)
        }

        try {
          const rec = await aiService.getRecommendation()
          setRecommendation(rec)
        } catch (e) {
          console.warn('Failed to load recommendation', e)
        }
      } catch (err) {
        console.error('Failed to load student progress', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const vocabScore = progress?.vocabularyScore ?? 85
  const grammarScore = progress?.grammarScore ?? 78
  const speakingScore = progress?.speakingScore ?? 82
  const pronunciationScore = progress?.pronunciationScore ?? 80
  const overallAccuracy = Math.round(progress?.accuracy ?? 84)

  return (
    <div className="world-screen world-courtyard" style={{ minHeight: '100vh', paddingBottom: '120px' }}>
      <div className="world-copy">
        <span className="world-kicker">Learning Mastery & Analytics</span>
        <h1>Your English Superpowers</h1>
        <p>Track your vocabulary, speaking fluency, accuracy, and streak across Talkora.</p>
      </div>

      <main style={{ maxWidth: '860px', margin: '30px auto 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* KPI Stats Grid */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <div className="stat yellow" style={{ border: '3px solid #172554' }}>
            <span>Overall Accuracy</span>
            <strong>{overallAccuracy}%</strong>
          </div>
          <div className="stat blue" style={{ border: '3px solid #172554' }}>
            <span>Total Word XP</span>
            <strong>{progress?.totalXp ?? 120}</strong>
          </div>
          <div className="stat green" style={{ border: '3px solid #172554' }}>
            <span>Active Streak</span>
            <strong>{progress?.streak ?? 5} Days</strong>
          </div>
          <div className="stat pink" style={{ border: '3px solid #172554' }}>
            <span>Levels Mastered</span>
            <strong>{progress?.completedLevels ?? 1}/10</strong>
          </div>
        </div>

        {/* 4 Skill Mastery Bars */}
        <section className="panel" style={{ border: '4px solid #172554', borderRadius: '24px', boxShadow: '6px 6px 0 #172554' }}>
          <div className="section-head" style={{ marginBottom: '18px' }}>
            <div>
              <span className="eyebrow">Skill Breakdown</span>
              <h2>English Fluency Pillars</h2>
            </div>
            <span style={{ fontSize: '24px' }}>🎯</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                <span>📖 Vocabulary & Word Recognition</span>
                <span>{vocabScore}%</span>
              </div>
              <div className="progress-track" style={{ height: '14px', border: '2px solid #172554' }}>
                <span style={{ width: `${vocabScore}%`, background: '#ffd83d' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                <span>🧩 Grammar & Sentence Construction</span>
                <span>{grammarScore}%</span>
              </div>
              <div className="progress-track" style={{ height: '14px', border: '2px solid #172554' }}>
                <span style={{ width: `${grammarScore}%`, background: '#28b8ff' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                <span>🎙️ Speaking & Conversational Voice</span>
                <span>{speakingScore}%</span>
              </div>
              <div className="progress-track" style={{ height: '14px', border: '2px solid #172554' }}>
                <span style={{ width: `${speakingScore}%`, background: '#ff7a3d' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                <span>🗣️ Pronunciation Clarity</span>
                <span>{pronunciationScore}%</span>
              </div>
              <div className="progress-track" style={{ height: '14px', border: '2px solid #172554' }}>
                <span style={{ width: `${pronunciationScore}%`, background: '#52d273' }} />
              </div>
            </div>
          </div>
        </section>

        {/* AI Recommendations */}
        {recommendation && (
          <section className="panel" style={{ background: '#eef8ff', border: '4px solid #172554', borderRadius: '24px', boxShadow: '6px 6px 0 #172554' }}>
            <span className="eyebrow" style={{ color: '#28b8ff' }}>Miss Julie&apos;s Learning Diagnosis</span>
            <h3 style={{ fontSize: '20px', color: '#172554', marginTop: '4px' }}>Recommended Next Step</h3>
            <p style={{ color: '#172554', fontWeight: 800, fontSize: '16px', marginTop: '8px' }}>
              &ldquo;{recommendation.message}&rdquo;
            </p>
            <div style={{ marginTop: '14px' }}>
              <Link href="/student/levels" className="world-button" style={{ background: '#28b8ff', color: '#172554' }}>
                Practice Recommended Topic →
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <nav className="world-nav" aria-label="Student Navigation">
        <Link href="/student/dashboard">Home</Link>
        <Link href="/student/levels">Adventure Map</Link>
        <Link href="/student/classes">Classes</Link>
        <Link className="learn-active" href="/student/progress">Progress</Link>
        <Link href="/student/rewards">Rewards</Link>
        <Link href="/student/profile">Profile</Link>
      </nav>
    </div>
  )
}
