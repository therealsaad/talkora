'use client'

import React, { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { curriculumService, LevelItem, CurriculumClass } from '@/services/curriculum-service'
import { authService, AuthSession } from '@/services/auth-service'
import { worldFor } from '@/services/world-catalog'

function StudentLevelsMapContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [levels, setLevels] = useState<LevelItem[]>([])
  const [selectedClass, setSelectedClass] = useState<CurriculumClass | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMap() {
      try {
        const auth = await authService.getMe()
        if (!auth || auth.role !== 'STUDENT') {
          router.push('/login/student')
          return
        }
        setSession(auth)

        const classes = await curriculumService.getClasses()
        const queryClassId = searchParams.get('classId')
        const studentGrade = auth.student?.grade || 4

        const activeClass = queryClassId
          ? classes.find((c) => c.id === queryClassId) || classes[0]
          : classes.find((c) => c.grade === studentGrade) || classes[0]

        setSelectedClass(activeClass)

        if (activeClass) {
          const lvls = await curriculumService.getLevels(activeClass.id)
          setLevels(lvls)
        }
      } catch (err) {
        console.error('Failed to load level map', err)
      } finally {
        setLoading(false)
      }
    }
    loadMap()
  }, [router, searchParams])

  // Destination landmark icons
  const levelIcons: Record<number, string> = {
    1: '🌱', // Classroom / Word Garden
    2: '🧩', // Sentence Builder
    3: '🎙️', // Speaking Starter
    4: '📚', // Story World
    5: '🍦', // Conversation Corner / Ice Cream
    6: '🏰', // Grammar Garden
    7: '📖', // Reading Adventure
    8: '🎧', // Listening Lab
    9: '🏖️', // Speaking Quest / Beach
    10: '🏆', // Final Challenge / Festival
  }

  return (
    <div className="world-screen world-map" style={{ minHeight: '100vh', paddingBottom: '140px' }}>
      {/* Decorative props */}
      <div className="scene-props props-map" aria-hidden="true">
        <span className="cloud cloud-a" />
        <span className="cloud cloud-b" />
        <span className="sun-dot" />
        <span className="tree tree-left" />
        <span className="tree tree-right" />
      </div>

      <div className="world-copy">
        <span className="world-kicker">
          {selectedClass ? selectedClass.name : 'Class 4'} · English Quest Map
        </span>
        <h1>Talkora Town Adventure</h1>
        <p>Complete each checkpoint to unlock the next world and earn your badge!</p>
      </div>

      <main style={{ maxWidth: '920px', margin: '30px auto 0', position: 'relative', zIndex: 4 }}>
        {/* Signboard */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div
            style={{
              background: '#ffd83d',
              border: '4px solid #172554',
              borderRadius: '16px',
              padding: '10px 18px',
              boxShadow: '4px 4px 0 #172554',
              fontWeight: 900,
              color: '#172554',
            }}
          >
            🗺️ {selectedClass?.name || 'Class 4'} Map · 10 Destinations
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#fffaf0', border: '3px solid #172554', borderRadius: '14px', padding: '6px 14px', fontSize: '12px', fontWeight: 800 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#52d273', display: 'inline-block' }} /> Mastered
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffd83d', display: 'inline-block' }} /> Current
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#d6c8b0', display: 'inline-block' }} /> Locked
            </span>
          </div>
        </div>

        {/* Adventure Map Canvas Board */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', fontWeight: 900, color: '#172554' }}>
            Unfolding your adventure map...
          </div>
        ) : (
          <div className="map-board talkora-atlas" style={{ height: '1120px', position: 'relative' }}>
            <div className="map-sign">
              {selectedClass?.name || 'CLASS 4'}
              <br />
              <strong>MISSION PATH</strong>
              <small>10 Adventure Levels</small>
            </div>

            <div className="town-banner">
              <span>Miss Julie&apos;s Mission</span>
              <strong>Speak with confidence!</strong>
              <small>Master each node to light up the path.</small>
            </div>

            {/* Winding Adventure Road */}
            <div className="map-road" style={{ height: '82%', top: '10%' }} />

            {/* Level Nodes */}
            <div className="world-level-path">
              {levels.map((level, index) => {
                const world = worldFor(level)
                const isEven = index % 2 === 0
                // Winding zigzag path positions
                const xPos = isEven ? 28 : 72
                const yPos = 13 + index * 9.05

                const isLocked = level.status === 'locked'
                const isCompleted = level.status === 'completed'
                const isCurrent = level.status === 'in-progress' || (!isLocked && !isCompleted && index === 0)

                return (
                  <Link
                    key={level.id}
                    href={isLocked ? '#' : `/student/levels/${level.number}`}
                    className={`world-level-node ${level.status} ${isCurrent ? 'current' : ''}`}
                    style={{
                      left: `${xPos}%`,
                      top: `${yPos}%`,
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                    }}
                    onClick={(e) => {
                      if (isLocked) e.preventDefault()
                    }}
                  >
                    <span
                      style={{
                        background: isCompleted ? '#52d273' : isCurrent ? '#ffd83d' : isLocked ? '#d4dfd7' : '#ffffff',
                        border: '4px solid #172554',
                        boxShadow: isCurrent ? '0 0 0 8px rgba(255,216,61,0.5), 5px 5px 0 #172554' : '4px 4px 0 #172554',
                        color: '#172554',
                      }}
                    >
                      {isCompleted ? '★' : isLocked ? '🔒' : levelIcons[level.number] || level.number}
                    </span>
                    <b style={{ color: '#172554', textShadow: '1px 1px 0 #fff' }}>
                      {level.number}. {world.illustration}
                    </b>
                    <small style={{ color: '#244b38', fontWeight: 900 }}>{level.lessonCount || world.lessons.length} lessons · {level.place}</small>
                    <em>
                      {isCompleted
                        ? 'Mastered ★★★'
                        : isCurrent
                        ? 'Continue Quest ▶'
                        : isLocked
                        ? 'Locked'
                        : 'Ready to Explore'}
                    </em>
                  </Link>
                )
              })}
            </div>
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

export default function StudentLevelsMapPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: 'center', padding: '60px', fontWeight: 900, color: '#172554' }}>
          Loading Adventure Map...
        </div>
      }
    >
      <StudentLevelsMapContent />
    </Suspense>
  )
}
