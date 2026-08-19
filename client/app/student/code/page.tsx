'use client'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { currentStudent, students } from '@/services/mock-data'
import { getSelectedStudentId } from '@/services/mock-auth'
import { AuthFrame } from '@/components/auth/auth-card'

export default function StudentCodePage() { const router = useRouter(); const [code, setCode] = useState(''); const [error, setError] = useState(''); const student = students.find(s => s.id === getSelectedStudentId()) || currentStudent; function submit(e: FormEvent) { e.preventDefault(); if (code.trim().toUpperCase() === student.studentCode) router.push('/student/dashboard'); else setError('That code is not quite right. Check with your teacher and try again.') } return <AuthFrame title={`Hi, ${student.fullName.split(' ')[0]}!`} subtitle="One last step and your Talkora adventure begins."><form className="auth-card" onSubmit={submit}><span className="eyebrow">Student portal · Step 3 of 3</span><h2>Enter your Talkora code</h2><p>Your code keeps your learning journey safe.</p><label>Student Code<input autoFocus required value={code} onChange={e => setCode(e.target.value)} placeholder={student.studentCode} /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-dark wide">Continue to dashboard</button></form></AuthFrame> }
