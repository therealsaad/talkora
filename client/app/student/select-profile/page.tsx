'use client'
import { useRouter } from 'next/navigation'
import { students } from '@/services/mock-data'
import { setSelectedStudent } from '@/services/mock-auth'
import { AuthFrame } from '@/components/auth/auth-card'

export default function SelectProfilePage() { const router = useRouter(); return <AuthFrame title="Who are you?" subtitle="Choose your profile to continue your learning adventure."><section className="auth-card profile-card"><span className="eyebrow">Student portal · Step 2 of 3</span><h2>Choose your profile</h2><p>Tap your name below.</p><div className="profile-grid">{students.map(student => <button className="profile-choice" key={student.id} onClick={() => { setSelectedStudent(student.id); router.push('/student/code') }}><span className="avatar soft">{student.initials}</span><strong>{student.fullName}</strong><small>{student.className}</small></button>)}</div></section></AuthFrame> }
