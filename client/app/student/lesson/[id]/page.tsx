'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ActivityEngine } from '@/components/lessons/activity-engine'
import { curriculumService, ActivityItem, LevelItem, LessonItem } from '@/services/curriculum-service'
import { authService, AuthSession } from '@/services/auth-service'
import { MissJulieGuide } from '@/components/miss-julie/miss-julie-guide'

export default function StudentLessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonIdParam = params?.id as string

  const [session, setSession] = useState<AuthSession | null>(null)
  const [level, setLevel] = useState<LevelItem | null>(null)
  const [lesson, setLesson] = useState<LessonItem | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLesson() {
      try {
        const auth = await authService.getMe()
        if (!auth || auth.role !== 'STUDENT') {
          router.push('/login/student')
          return
        }
        setSession(auth)

        const classes = await curriculumService.getClasses()
        const myGrade = auth.student?.grade || 4
        const myClass = classes.find((c) => c.grade === myGrade) || classes[0]

        if (myClass) {
          const levels = await curriculumService.getLevels(myClass.id)
          // Find matching level either by id or by number
          const lvl =
            levels.find((l) => l.id === lessonIdParam || String(l.number) === lessonIdParam) || levels[0]
          setLevel(lvl)

          if (lvl) {
            const lessons = await curriculumService.getLessons(lvl.id)
            const lsn = lessons[0]
            setLesson(lsn)

            if (lsn) {
              const acts = await curriculumService.getActivities(lsn.id)
              setActivities(acts)
            }
          }
        }
      } catch (err) {
        console.error('Failed to load lesson', err)
      } finally {
        setLoading(false)
      }
    }

    loadLesson()
  }, [lessonIdParam, router])

  return (
    <div className="world-screen world-classroom world-compact" style={{ minHeight: '100vh', paddingBottom: '120px' }}>
      {/* Decorative classroom props */}
      <div className="scene-props props-classroom" aria-hidden="true">
        <span className="chalkboard" />
        <span className="desk desk-a" />
        <span className="desk desk-b" />
        <span className="window" />
        <span className="book-stack" />
      </div>

      {/* Classroom Header */}
      <div className="world-copy" style={{ paddingTop: '20px' }}>
        <span className="world-kicker">
          Class {session?.student?.grade || 4} · Level {level?.number || 1}: {level?.title || 'Word Explorer'}
        </span>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', margin: '6px 0' }}>
          {level?.place || 'Classroom'} Learning Session
        </h1>
      </div>

      {!loading && <MissJulieGuide context="lesson" destination={lesson?.title || level?.title} compact />}

      {/* Main Activity Stage */}
      <main style={{ maxWidth: '780px', margin: '20px auto 0', position: 'relative', zIndex: 5 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#fff', border: '4px solid #172554', borderRadius: '24px', boxShadow: '6px 6px 0 #172554' }}>
            <img src="/miss-julie/thinking.png" alt="Loading" style={{ width: '80px', height: '80px', margin: '0 auto' }} />
            <h3 style={{ marginTop: '12px' }}>Preparing your lesson activities...</h3>
          </div>
        ) : activities.length > 0 ? (
          <ActivityEngine
            activities={activities}
            levelTitle={level?.title}
            levelNumber={level?.number}
            onLessonComplete={(xp) => {
              console.log('Lesson completed, XP earned:', xp)
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', background: '#fff', border: '3px solid #172554', borderRadius: '20px' }}>
            <h3>No activities found for this level.</h3>
            <Link href="/student/levels" className="world-button" style={{ marginTop: '16px' }}>
              Return to Map
            </Link>
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <nav className="world-nav" aria-label="Student Navigation">
        <Link href="/student/dashboard">Home</Link>
        <Link className="learn-active" href="/student/levels">Adventure Map</Link>
        <Link href="/student/classes">Classes</Link>
        <Link href="/student/progress">Progress</Link>
        <Link href="/student/rewards">Rewards</Link>
        <Link href="/student/profile">Profile</Link>
      </nav>
    </div>
  )
}
