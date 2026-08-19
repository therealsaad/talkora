'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DEMO_SCHOOL_CODE, DEMO_SCHOOL_PASSWORD } from '@/services/mock-auth'

export function AuthFrame({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return <main className="auth-page"><section className="auth-art"><div className="chalk-star" /><span className="brand"><span className="brand-mark">T</span><span>talkora</span></span><h1>{title}</h1><p>{subtitle}</p><div className="auth-character"><img src="/miss-julie-portrait.png" alt="Miss Julie welcoming you" /></div></section><section className="auth-form-area">{children}</section></main>
}

export function SchoolLoginCard() {
  const router = useRouter(); const [code, setCode] = useState(''); const [password, setPassword] = useState(''); const [show, setShow] = useState(false); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  function submit(e: FormEvent) { e.preventDefault(); setLoading(true); setError(''); setTimeout(() => { setLoading(false); if (code === DEMO_SCHOOL_CODE && password === DEMO_SCHOOL_PASSWORD) router.push('/school/dashboard'); else setError('That code or password did not match. Try the demo details below.') }, 500) }
  return <form className="auth-card" onSubmit={submit}><span className="eyebrow">School / teacher portal</span><h2>Welcome, School!</h2><p>Let&apos;s get your Talkora classroom ready.</p><label>School Code<input required value={code} onChange={e => setCode(e.target.value)} placeholder="DEMO001" /></label><label>Password<div className="input-with-action"><input required type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="talkora123" /><button type="button" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button></div></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-dark wide" disabled={loading}>{loading ? 'Opening classroom...' : 'Login to school'}</button><small className="demo-hint">Demo: DEMO001 / talkora123</small><Link className="back-link" href="/">Back to Talkora</Link></form>
}
