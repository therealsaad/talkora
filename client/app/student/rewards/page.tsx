'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { progressService, AchievementItem } from '@/services/progress-service'
import { authService, AuthSession } from '@/services/auth-service'

export default function StudentRewardsPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [achievements, setAchievements] = useState<AchievementItem[]>([])
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

        const list = await progressService.getMyAchievements()
        setAchievements(list)
      } catch (err) {
        console.error('Failed to load achievements', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  return (
    <div className="world-screen world-celebration" style={{ minHeight: '100vh', paddingBottom: '120px' }}>
      <div className="world-copy">
        <span className="world-kicker">Sticker Book & Trophy Room</span>
        <h1>Your Talkora Rewards</h1>
        <p>Earn badges, collect stars, and celebrate every milestone with Miss Julie!</p>
      </div>

      <main style={{ maxWidth: '860px', margin: '30px auto 0' }}>
        <div
          style={{
            background: '#fffaf0',
            border: '4px solid #172554',
            borderRadius: '24px',
            boxShadow: '8px 8px 0 #172554',
            padding: '28px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span className="eyebrow">Collector&apos;s Album</span>
              <h2 style={{ fontSize: '28px', color: '#172554' }}>Achievement Stickers</h2>
            </div>
            <span style={{ background: '#ffd83d', border: '2px solid #172554', borderRadius: '999px', padding: '6px 14px', fontWeight: 900, fontSize: '13px' }}>
              ⭐ {achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
            }}
          >
            {achievements.map((item) => (
              <div
                key={item.id || item.key}
                style={{
                  background: item.unlocked ? '#ffffff' : '#f0ede6',
                  border: '3px solid #172554',
                  borderRadius: '18px',
                  boxShadow: item.unlocked ? '4px 4px 0 #172554' : 'none',
                  padding: '16px',
                  textAlign: 'center',
                  opacity: item.unlocked ? 1 : 0.6,
                  filter: item.unlocked ? 'none' : 'grayscale(0.8)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: item.unlocked ? '#ffd83d' : '#d4cfc7',
                    border: '3px solid #172554',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    margin: '0 auto 10px',
                    boxShadow: item.unlocked ? '2px 2px 0 #172554' : 'none',
                  }}
                >
                  {item.category === 'speaking' ? '🎙️' : item.category === 'streak' ? '🔥' : '⭐'}
                </div>
                <strong style={{ display: 'block', fontSize: '15px', color: '#172554' }}>{item.title}</strong>
                <small style={{ display: 'block', color: '#53665d', fontWeight: 700, marginTop: '4px', fontSize: '11px' }}>
                  {item.description}
                </small>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    fontSize: '10px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    color: item.unlocked ? '#1b6b35' : '#7b6d60',
                  }}
                >
                  {item.unlocked ? 'Unlocked ✓' : 'Locked 🔒'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating Bottom Navigation */}
      <nav className="world-nav" aria-label="Student Navigation">
        <Link href="/student/dashboard">Home</Link>
        <Link href="/student/levels">Adventure Map</Link>
        <Link href="/student/classes">Classes</Link>
        <Link href="/student/progress">Progress</Link>
        <Link className="learn-active" href="/student/rewards">Rewards</Link>
        <Link href="/student/profile">Profile</Link>
      </nav>
    </div>
  )
}
