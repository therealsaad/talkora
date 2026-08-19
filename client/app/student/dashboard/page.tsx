'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { authService, type AuthSession } from '@/services/auth-service'
import { curriculumService, type LevelItem } from '@/services/curriculum-service'
import { aiService, type AIRecommendation } from '@/services/ai-service'
import { MissJulieGuide } from '@/components/miss-julie/miss-julie-guide'

export default function StudentDashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentLevel, setCurrentLevel] = useState<LevelItem | null>(null)
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const auth = await authService.getMe()
        if (!auth || auth.role !== 'STUDENT') {
          router.push('/login/student')
          return
        }
        setSession(auth)
        const classes = await curriculumService.getClasses()
        const studentClass = classes.find((item) => item.grade === (auth.student?.grade || 4)) || classes[0]
        if (studentClass) {
          const levels = await curriculumService.getLevels(studentClass.id)
          setCurrentLevel(levels.find((item) => item.status === 'in-progress' || item.status === 'available') || levels[0])
        }
        try { setRecommendation(await aiService.getRecommendation()) } catch { /* optional coach note */ }
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [router])

  const firstName = (session?.student?.fullName || 'Explorer').split(' ')[0]
  if (loading) return <div className="world-screen world-courtyard dashboard-loading"><img src="/miss-julie/thinking.png" alt="Miss Julie is preparing your classroom" /><p>Opening your classroom…</p></div>

  return (
    <div className="world-screen world-courtyard">
      <div className="scene-props props-courtyard" aria-hidden="true"><span className="cloud cloud-a" /><span className="cloud cloud-b" /><span className="sun-dot" /><span className="tree tree-left" /><span className="tree tree-right" /><span className="butterfly butterfly-a">+</span><span className="butterfly butterfly-b">+</span></div>
      <header className="world-copy">
        <span className="world-kicker">{session?.school?.name || 'Talkora classroom'} · Class {session?.student?.grade || 4}</span>
        <h1>Hi, {firstName}!</h1>
        <p>Choose a place to learn, listen to Miss Julie, and enjoy your English adventure.</p>
      </header>
      <MissJulieGuide context="home" />
      <nav className="town-landmarks" aria-label="Learning destinations">
        <Link className="town-landmark landmark-school" href="/student/levels"><span className="landmark-roof" /><strong>Adventure map</strong><small>Choose a story</small></Link>
        <Link className="town-landmark landmark-garden" href="/student/classes"><span className="landmark-tree" /><strong>Classroom</strong><small>Learn new words</small></Link>
        <Link className="town-landmark landmark-booth" href={`/student/lesson/${currentLevel?.number || 1}`}><span className="landmark-booth-shape">MIC</span><strong>Speaking studio</strong><small>Talk with Julie</small></Link>
        <Link className="town-landmark landmark-shop" href="/student/rewards"><span className="landmark-chest">★</span><strong>Storybook</strong><small>Your happy moments</small></Link>
      </nav>
      <main className="home-base student-home-grid simple-dashboard">
        <section className="adventure-board mission-card">
          <span className="board-label">Today&apos;s classroom story</span>
          <h2>{currentLevel?.title || 'Word Explorer'}</h2>
          <p>{currentLevel?.description || 'Learn everyday words, sentence structures, and practice speaking aloud.'}</p>
          <div className="mission-meta"><span>In the {currentLevel?.place || 'classroom'}</span><span>A short, friendly lesson</span></div>
          <Link className="world-button" href={`/student/lesson/${currentLevel?.number || 1}`}>Start learning →</Link>
        </section>
        <section className="review-card julie-note">
          <span className="board-label">A note from Miss Julie</span>
          <h2>Let&apos;s learn together</h2>
          <p>&ldquo;{recommendation?.message || 'Take your time, be curious, and say each new word out loud with me.'}&rdquo;</p>
          {recommendation?.focusSkill && <small>Today we&apos;ll explore: <strong>{recommendation.focusSkill}</strong></small>}
        </section>
      </main>
      <nav className="world-nav" aria-label="Student Navigation"><Link className="learn-active" href="/student/dashboard">Home</Link><Link href="/student/levels">Adventure map</Link><Link href="/student/classes">Classroom</Link><Link href="/student/rewards">Storybook</Link><Link href="/student/profile">Profile</Link></nav>
    </div>
  )
}
