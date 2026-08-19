'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthFrame } from '@/components/auth/auth-frame'
import { authService, StudentProfileOption } from '@/services/auth-service'

export default function StudentLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [schoolCode, setSchoolCode] = useState('DEMO001')
  const [schoolName, setSchoolName] = useState('')
  const [students, setStudents] = useState<StudentProfileOption[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentProfileOption | null>(null)
  const [studentCode, setStudentCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Step 1: Lookup School
  async function handleSchoolSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const code = schoolCode.trim().toUpperCase()
      const data = await authService.lookupStudents(code)
      setSchoolName(data.school.name)
      setStudents(data.students)
      setStep(2)
    } catch (err: any) {
      setError(err.message || 'Could not find a school with that code. Try "DEMO001".')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Select Student
  function handleSelectStudent(student: StudentProfileOption) {
    setSelectedStudent(student)
    setError('')
    setStudentCode('')
    setStep(3)
  }

  // Step 3: Enter Student Code & Log In
  async function handleStudentLogin(e: FormEvent) {
    e.preventDefault()
    if (!selectedStudent) return
    setError('')
    setLoading(true)

    try {
      await authService.loginStudent(
        schoolCode.trim().toUpperCase(),
        selectedStudent.id,
        studentCode.trim().toUpperCase()
      )
      router.push('/student/dashboard')
    } catch (err: any) {
      setError(err.message || 'That code was not correct. Please ask your teacher or try again.')
    } finally {
      setLoading(false)
    }
  }

  // Choose appropriate Miss Julie pose based on current step
  const pose = step === 1 ? 'welcome' : step === 2 ? 'thinking' : 'encouraging'
  const title =
    step === 1
      ? 'Welcome, Explorer!'
      : step === 2
      ? `Welcome to ${schoolName || 'Talkora'}!`
      : `Hi, ${selectedStudent?.fullName.split(' ')[0] || 'Explorer'}!`
  const subtitle =
    step === 1
      ? 'Your English adventure is waiting. First, enter your School Code.'
      : step === 2
      ? 'Find your name below to jump into your English world.'
      : 'Enter your secret Talkora code to start exploring!'

  return (
    <AuthFrame title={title} subtitle={subtitle} pose={pose} badgeText={`Student Portal · Step ${step} of 3`}>
      {step === 1 && (
        <form className="auth-card" onSubmit={handleSchoolSubmit}>
          <span className="eyebrow">Student Adventure · Step 1</span>
          <h2>Enter School Code</h2>
          <p>Ask your teacher for your school&apos;s special Talkora code.</p>

          <label>
            School Code
            <input
              required
              autoFocus
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
              placeholder="e.g. DEMO001"
              maxLength={16}
            />
          </label>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <button className="button button-dark wide" disabled={loading} type="submit">
            {loading ? 'Finding school...' : 'Find My School →'}
          </button>

          <small className="demo-hint">Demo School Code: <strong>DEMO001</strong></small>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px' }}>
            <Link className="back-link" href="/">← Back to Home</Link>
            <Link className="back-link" href="/login/school">School Portal</Link>
          </div>
        </form>
      )}

      {step === 2 && (
        <section className="auth-card profile-card" style={{ maxWidth: '520px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="eyebrow">Student Adventure · Step 2</span>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ background: 'none', border: 'none', color: '#c55c35', fontWeight: 800, cursor: 'pointer', fontSize: '12px' }}
            >
              Change School
            </button>
          </div>
          <h2>Who are you?</h2>
          <p>Tap your name below to open your profile.</p>

          <div
            className="profile-grid"
            style={{
              maxHeight: '340px',
              overflowY: 'auto',
              padding: '4px',
            }}
          >
            {students.map((student) => {
              const avatarNames = ['aarav', 'ananya', 'kabir', 'meera', 'rahul', 'sara']
              const avatarName = avatarNames[students.indexOf(student) % avatarNames.length]
              const initials = student.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
              return (
                <button
                  key={student.id}
                  className="profile-choice explorer-profile-card"
                  type="button"
                  onClick={() => handleSelectStudent(student)}
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                >
                  <span className="explorer-avatar" style={{ background: ['#ffe3ae', '#9dd4ff', '#ff9cba', '#cdb5ff', '#96e6cc', '#ffe888'][students.indexOf(student) % 6] }}>
                    <img src={`/avatars/${avatarName}.png`} alt="" />
                  </span>
                  <strong>{student.fullName}</strong>
                  <small>
                    Class {student.grade}
                    {student.className ? ` (${student.className})` : ''} · Roll {student.rollNumber}
                  </small>
                </button>
              )
            })}
          </div>

          {students.length === 0 && (
            <p style={{ textAlign: 'center', color: '#7b6d60' }}>
              No students found for this school code yet. Please ask your teacher to add your name!
            </p>
          )}

          <button
            className="button button-light wide"
            type="button"
            onClick={() => setStep(1)}
            style={{ marginTop: '8px' }}
          >
            ← Back to School Code
          </button>
        </section>
      )}

      {step === 3 && selectedStudent && (
        <form className="auth-card" onSubmit={handleStudentLogin}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="eyebrow">Student Adventure · Step 3</span>
            <button
              type="button"
              onClick={() => setStep(2)}
              style={{ background: 'none', border: 'none', color: '#c55c35', fontWeight: 800, cursor: 'pointer', fontSize: '12px' }}
            >
              Switch Student
            </button>
          </div>
          <h2>Enter Your Code</h2>
          <p>
            Hello <strong>{selectedStudent.fullName}</strong>! Enter your 4-letter Talkora student code.
          </p>

          <label>
            Student Code / PIN
            <input
              required
              autoFocus
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
              placeholder="e.g. WXFN"
              maxLength={12}
              style={{ letterSpacing: '4px', fontSize: '18px', textAlign: 'center', fontWeight: 900 }}
            />
          </label>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <button className="button button-dark wide" disabled={loading} type="submit">
            {loading ? 'Starting adventure...' : "Let's Go! 🚀"}
          </button>

          <small className="demo-hint">
            (Check teacher dashboard or seed output if you forgot your 4-letter code)
          </small>

          <button
            className="button button-light wide"
            type="button"
            onClick={() => setStep(2)}
            style={{ marginTop: '8px' }}
          >
            ← Pick Another Student
          </button>
        </form>
      )}
    </AuthFrame>
  )
}
