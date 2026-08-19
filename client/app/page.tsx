'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, GraduationCap, Mic, Sparkles } from 'lucide-react'

import { GlassCard } from '@/components/ui/glass-card'

export default function LandingPage() {
  return (
    <main className="landing glass-landing">
      <section className="landing-copy glass-copy">
        <div className="landing-brand">
          <span className="brand-mark">T</span><span>talkora</span><span className="grade-pill">Classes 4 – 10</span>
        </div>
        <span className="hero-kicker"><Sparkles size={15} /> AI-powered English learning world</span>
        <h1>Every word opens<br />a new <em>world.</em></h1>
        <p className="landing-lede">A vibrant English adventure with real speaking practice, playful missions, and Miss Julie cheering every learner on.</p>
        <div className="portal-actions">
          <Link href="/login/student" className="portal-action portal-action-primary"><BookOpen size={21} /><span><b>Student portal</b><small>Start an adventure</small></span><ArrowRight size={19} /></Link>
          <Link href="/login/teacher" className="portal-action"><GraduationCap size={21} /><span><b>Teacher portal</b><small>Guide your class</small></span><ArrowRight size={19} /></Link>
          <Link href="/login/school" className="portal-action"><Sparkles size={21} /><span><b>School admin</b><small>Manage your world</small></span><ArrowRight size={19} /></Link>
        </div>
        <div className="feature-pills"><span><Mic size={15} /> Real speaking practice</span><span><Sparkles size={15} /> Personalized missions</span></div>
      </section>
      <section className="landing-art classroom-scene" aria-label="A magical Talkora classroom">
        <div className="classroom-window"><i /><i /><i /></div><div className="classroom-board"><span>hello!</span><i>★</i><b>ABC</b></div>
        <div className="classroom-desk desk-one" /><div className="classroom-desk desk-two" /><div className="floating-book book-one" /><div className="floating-book book-two" />
        <GlassCard className="classroom-note"><Sparkles size={17} /><span>Today&apos;s magic:<b>Speak with confidence</b></span></GlassCard>
        <div className="hero-julie"><img src="/miss-julie/welcome.png" alt="Miss Julie, your AI English Teacher" /></div>
      </section>
    </main>
  )
}
