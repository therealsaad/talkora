'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ActivityItem } from '@/services/curriculum-service'
import { progressService, AttemptResult } from '@/services/progress-service'
import { voiceService } from '@/services/voice-service'
import { aiService } from '@/services/ai-service'

type LessonPhase = 'teaching' | 'ready' | 'playing' | 'listening_mic' | 'evaluating' | 'correct' | 'retry' | 'completed'

interface ActivityEngineProps {
  activities: ActivityItem[]
  levelTitle?: string
  levelNumber?: number
  onLessonComplete?: (xpEarned: number) => void
}

export function ActivityEngine({
  activities,
  levelTitle = 'Word Explorer',
  levelNumber = 1,
  onLessonComplete,
}: ActivityEngineProps) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<LessonPhase>('teaching')
  const [selected, setSelected] = useState('')
  const [scrambleLetters, setScrambleLetters] = useState<string[]>([])
  const [spelledWord, setSpelledWord] = useState<string[]>([])
  const [sentenceWords, setSentenceWords] = useState<string[]>([])
  const [builtSentence, setBuiltSentence] = useState<string[]>([])
  const [totalXp, setTotalXp] = useState(0)
  const [streak, setStreak] = useState(5)
  const [heard, setHeard] = useState(false)
  const [spokenTranscript, setSpokenTranscript] = useState('')
  const [voiceFeedback, setVoiceFeedback] = useState<{ score: number; feedback: string } | null>(null)
  const [activityStartedAt, setActivityStartedAt] = useState(() => new Date().toISOString())
  const [missJuliePose, setMissJuliePose] = useState<'teaching' | 'listening' | 'encouraging' | 'celebrating' | 'thinking'>('teaching')
  const [submitting, setSubmitting] = useState(false)
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([])

  const recognitionRef = useRef<any>(null)
  const activity = activities[index]

  const isSpeaking =
    activity?.type === 'SPEAKING' ||
    activity?.type === 'LISTEN_AND_REPEAT' ||
    activity?.type === 'speaking' ||
    activity?.type === 'listenAndRepeat' ||
    activity?.type === 'pronunciation'

  const isSpelling = activity?.type === 'SPELLING' || activity?.type === 'spelling'
  const isSentenceBuilder = activity?.type === 'SENTENCE_BUILDER' || activity?.type === 'sentenceBuilder'

  // Initialize activity state when index changes
  useEffect(() => {
    if (!activity) return
    setPhase('teaching')
    setSelected('')
    setHeard(false)
    setSpokenTranscript('')
    setVoiceFeedback(null)
    setActivityStartedAt(new Date().toISOString())
    setMissJuliePose('teaching')

    // Prepare spelling tiles
    if (isSpelling) {
      const letters = (activity.choices && activity.choices.length > 0)
        ? [...activity.choices].sort(() => Math.random() - 0.5)
        : activity.target.split('').sort(() => Math.random() - 0.5)
      setScrambleLetters(letters)
      setSpelledWord([])
    }

    // Prepare sentence builder tiles
    if (isSentenceBuilder) {
      const words = (activity.choices && activity.choices.length > 0)
        ? [...activity.choices].sort(() => Math.random() - 0.5)
        : activity.target.replace(/[.!?,]/g, '').split(' ').sort(() => Math.random() - 0.5)
      setSentenceWords(words)
      setBuiltSentence([])
    }

    const timer = setTimeout(() => {
      setPhase('ready')
    }, 1200)

    return () => clearTimeout(timer)
  }, [activity, index, isSpelling, isSentenceBuilder])

  if (!activity) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>No activities found for this lesson.</h2>
        <Link href="/student/levels" className="world-button">
          Back to Map
        </Link>
      </div>
    )
  }

  // Voice synthesis by Miss Julie
  function hearMissJulie(text: string) {
    setHeard(true)
    voiceService.speakText(text)
  }

  // Handle Speech Recognition for speaking activities
  async function startSpeaking() {
    setPhase('listening_mic')
    setMissJuliePose('listening')
    setSpokenTranscript('')
    setVoiceFeedback(null)

    try {
      const session = await voiceService.startSession({ lessonId: activity.lessonId, activityId: activity.id })
      if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.lang = 'en-US'
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setSpokenTranscript(transcript)
          evaluateSpeech(transcript, session._id)
        }

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error', event.error)
          setVoiceFeedback({ score: 0, feedback: 'I could not hear you yet. Please allow microphone access and try again.' })
          setPhase('retry')
          setMissJuliePose('encouraging')
        }

        recognitionRef.current = recognition
        recognition.start()
      } else {
        setVoiceFeedback({ score: 0, feedback: 'Speech recognition is not available in this browser. Try a browser with microphone speech support.' })
        setPhase('retry')
        setMissJuliePose('encouraging')
      }
      }
    } catch {
      setVoiceFeedback({ score: 0, feedback: 'Miss Julie could not start a voice session. Please try again in a moment.' })
      setPhase('retry')
      setMissJuliePose('encouraging')
    }
  }

  // Evaluate speech attempt
  async function evaluateSpeech(transcript: string, sessionId: string) {
    setPhase('evaluating')
    setMissJuliePose('thinking')

    try {
      const voiceSession = await voiceService.submitTranscript(sessionId, transcript, activity.target)
      const score = voiceSession.evaluation?.score ?? 0
      let feedbackText = voiceSession.evaluation?.feedback || `Try saying "${activity.target}" slowly, one word at a time.`

      try {
        const aiResponse = await aiService.askMissJulie({
          message: `I said: "${transcript}". The target was "${activity.target}". Give me one short, kind pronunciation tip.`,
          lessonId: activity.lessonId,
          activityId: activity.id,
          context: 'pronunciation',
        })
        feedbackText = aiResponse.message || feedbackText
      } catch {
        // The server pronunciation feedback remains useful if the AI companion is unavailable.
      }

      setVoiceFeedback({ score, feedback: feedbackText })

      if (score >= 70) {
        setPhase('correct')
        setMissJuliePose('celebrating')
        setTotalXp((prev) => prev + Math.round((activity.xp || 20) * score / 100))
        voiceService.speakText('Awesome job! You spoke with great confidence.')
      } else {
        setPhase('retry')
        setMissJuliePose('encouraging')
        voiceService.speakText(feedbackText)
      }
    } catch {
      setVoiceFeedback({ score: 0, feedback: 'I could not evaluate that attempt. Please check your connection and try again.' })
      setPhase('retry')
      setMissJuliePose('encouraging')
    }
  }

  // Check multiple choice, matching, and standard answers
  async function checkAnswer() {
    setSubmitting(true)
    let userAnswer = selected.trim()

    if (isSpelling) {
      userAnswer = spelledWord.join('')
    } else if (isSentenceBuilder) {
      userAnswer = builtSentence.join(' ')
    }

    const target = (activity.answer || activity.target || '').trim()
    const isCorrect =
      userAnswer.toLowerCase() === target.toLowerCase() ||
      userAnswer.toLowerCase().replace(/[.!?,]/g, '') === target.toLowerCase().replace(/[.!?,]/g, '') ||
      userAnswer === 'I know this word'

    try {
      const result = await progressService.submitAttempt(activity.id, {
        answer: userAnswer,
        startedAt: activityStartedAt,
        hintsUsed: 0,
        idempotencyKey: `activity:${activity.id}:${activityStartedAt}`,
      })

      if (isCorrect) {
        setPhase('correct')
        setMissJuliePose('celebrating')
        setTotalXp((prev) => prev + (result.xpAwarded || activity.xp || 15))
        setStreak(result.progress?.streak || streak)
        if (result.unlockedAchievements?.length) {
          setUnlockedAchievements((prev) => [...prev, ...result.unlockedAchievements!])
        }
        voiceService.speakText('Superb! You got it right.')
      } else {
        setPhase('retry')
        setMissJuliePose('encouraging')
        voiceService.speakText('Almost there! Take a look at the clue and try again.')
      }
    } catch {
      if (isCorrect) {
        setPhase('correct')
        setTotalXp((prev) => prev + (activity.xp || 15))
      } else {
        setPhase('retry')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Move to next activity or complete lesson
  function nextStep() {
    if (index === activities.length - 1) {
      setPhase('completed')
      setMissJuliePose('celebrating')
      if (onLessonComplete) onLessonComplete(totalXp)
      voiceService.speakText('Hurray! You finished the entire adventure world!')
      return
    }
    setIndex((prev) => prev + 1)
  }

  // Helper for spelling tiles
  function pickLetter(letter: string, letterIndex: number) {
    setSpelledWord((prev) => [...prev, letter])
    setScrambleLetters((prev) => prev.filter((_, i) => i !== letterIndex))
    setPhase('playing')
  }

  function resetSpelling() {
    const letters = (activity.choices && activity.choices.length > 0)
      ? [...activity.choices].sort(() => Math.random() - 0.5)
      : activity.target.split('').sort(() => Math.random() - 0.5)
    setScrambleLetters(letters)
    setSpelledWord([])
  }

  // Helper for sentence builder tiles
  function pickWord(word: string, wordIndex: number) {
    setBuiltSentence((prev) => [...prev, word])
    setSentenceWords((prev) => prev.filter((_, i) => i !== wordIndex))
    setPhase('playing')
  }

  function resetSentence() {
    const words = (activity.choices && activity.choices.length > 0)
      ? [...activity.choices].sort(() => Math.random() - 0.5)
      : activity.target.replace(/[.!?,]/g, '').split(' ').sort(() => Math.random() - 0.5)
    setSentenceWords(words)
    setBuiltSentence([])
  }

  return (
    <section className={`teaching-flow phase-${phase}`} aria-live="polite">
      {/* Top status bar */}
      <header className="lesson-topbar">
        <span style={{ background: '#ffd83d', padding: '4px 10px', borderRadius: '12px', border: '2px solid #172554' }}>
          ⭐ XP {totalXp}
        </span>
        <div className="lesson-progress-track">
          <i
            style={{
              width: `${((index + (phase === 'completed' ? 1 : 0)) / activities.length) * 100}%`,
              background: '#52d273',
            }}
          />
        </div>
        <span style={{ background: '#ff4fa3', color: '#fff', padding: '4px 10px', borderRadius: '12px', border: '2px solid #172554' }}>
          🔥 Streak {streak}
        </span>
      </header>

      {/* Steps Indicator */}
      <div className="lesson-steps" aria-label="Lesson Journey">
        <span className={index === 0 ? 'active' : ''}>1. Learn</span>
        <span className={index > 0 && index < activities.length - 1 ? 'active' : ''}>2. Practice</span>
        <span className={index === activities.length - 1 || phase === 'completed' ? 'active' : ''}>3. Master</span>
      </div>

      {/* Miss Julie Guidance Card */}
      <div className="teacher-moment">
        <div className="teacher-avatar" style={{ overflow: 'hidden', padding: 0 }}>
          <img
            src={`/miss-julie/${missJuliePose}.png`}
            alt="Miss Julie avatar"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => {
              e.currentTarget.src = '/miss-julie/teaching.png'
            }}
          />
          <i className={isSpeaking || phase === 'listening_mic' ? 'speaking-dot speaking' : 'speaking-dot'} />
        </div>
        <div className="teacher-dialogue">
          <strong>Miss Julie · Your AI Teacher</strong>
          <p>
            {phase === 'teaching'
              ? `Watch and listen closely. Today's target is: ${activity.target}`
              : phase === 'listening_mic'
              ? 'I am listening... Speak clearly into your microphone!'
              : phase === 'evaluating'
              ? 'Analyzing your pronunciation...'
              : phase === 'correct'
              ? 'Brilliant work! You answered accurately.'
              : phase === 'retry'
              ? activity.hint || 'Almost! Take another try, you can do it.'
              : activity.prompt}
          </p>
          <button
            className="dialogue-audio"
            type="button"
            onClick={() => hearMissJulie(activity.prompt || activity.target)}
          >
            🔊 Hear Miss Julie Explain
          </button>
        </div>
      </div>

      {/* Lesson Complete View */}
      {phase === 'completed' ? (
        <div className="lesson-complete-scene" style={{ textAlign: 'center', padding: '30px 10px' }}>
          <div className="celebration-art" style={{ fontSize: '48px', margin: '16px 0' }}>
            🎉 ⭐ 🏆 ⭐ 🎉
          </div>
          <h2 style={{ color: '#172554', fontSize: '36px' }}>Adventure Complete!</h2>
          <p style={{ color: '#53665d', fontWeight: 800, fontSize: '18px' }}>
            You completed Level {levelNumber}: {levelTitle}!
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              margin: '24px 0',
              flexWrap: 'wrap',
            }}
          >
            <b style={{ background: '#ffd83d', border: '3px solid #172554', padding: '10px 18px', borderRadius: '16px', fontSize: '16px' }}>
              +{totalXp} XP Earned
            </b>
            <b style={{ background: '#52d273', color: '#172554', border: '3px solid #172554', padding: '10px 18px', borderRadius: '16px', fontSize: '16px' }}>
              ★★★ Mastered
            </b>
            <b style={{ background: '#ff4fa3', color: '#fff', border: '3px solid #172554', padding: '10px 18px', borderRadius: '16px', fontSize: '16px' }}>
              Next World Unlocked!
            </b>
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '20px' }}>
            <Link className="world-button" href="/student/levels">
              Continue on Adventure Map →
            </Link>
            <button
              className="button button-light"
              type="button"
              onClick={() => {
                setIndex(0)
                setPhase('teaching')
              }}
              style={{ marginTop: '18px' }}
            >
              Replay Lesson
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Visual Target Area */}
          <div className="learning-object">
            <div className="object-scene" style={{ background: '#28b8ff', color: '#ffffff' }}>
              <span className="object-spark">✦</span>
              <strong style={{ fontSize: '48px', textShadow: '2px 2px 0 #172554', color: '#ffffff' }}>
                {activity.target.length <= 12 ? activity.target : 'ENGLISH'}
              </strong>
              <span className="object-ground" />
            </div>

            <div className="word-display">
              <span>ACTIVITY {index + 1} OF {activities.length}</span>
              <h2>{activity.title}</h2>
              <p>{activity.prompt}</p>
            </div>
          </div>

          {/* Audio Playback Button */}
          <div className="lesson-actions">
            <button
              className={`listen-button ${heard ? 'heard' : ''}`}
              type="button"
              onClick={() => hearMissJulie(activity.target)}
            >
              <span aria-hidden="true">🔊</span>
              {heard ? 'Hear again' : `Hear "${activity.target}"`}
            </button>
            <span className="voice-status" style={{ color: '#40527d', fontWeight: 800 }}>
              {isSpeaking ? 'Press Speak when ready.' : 'Tap and solve with Miss Julie.'}
            </span>
          </div>

          {/* Interactive Activity Types */}
          <div className="practice-zone" style={{ margin: '20px 0' }}>
            {/* 1. Speaking Activity */}
            {isSpeaking && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ fontSize: '18px', fontWeight: 900, color: '#172554', marginBottom: '16px' }}>
                  Say aloud: &ldquo;{activity.target}&rdquo;
                </p>

                <button
                  className="button"
                  type="button"
                  onClick={startSpeaking}
                  disabled={phase === 'listening_mic' || phase === 'evaluating'}
                  style={{
                    background: phase === 'listening_mic' ? '#ff4fa3' : '#ffd83d',
                    color: '#172554',
                    border: '4px solid #172554',
                    borderRadius: '999px',
                    padding: '18px 36px',
                    fontSize: '18px',
                    fontWeight: 900,
                    boxShadow: '6px 6px 0 #172554',
                    cursor: 'pointer',
                    transform: phase === 'listening_mic' ? 'scale(1.05)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {phase === 'listening_mic' ? '🎙️ Listening... (Speak Now!)' : '🎙️ TAP TO SPEAK'}
                </button>

                {spokenTranscript && (
                  <div style={{ marginTop: '16px', background: '#fff', border: '2px solid #172554', borderRadius: '12px', padding: '10px 16px', display: 'inline-block' }}>
                    <small style={{ color: '#40527d', fontWeight: 800 }}>You said: </small>
                    <strong style={{ color: '#172554', fontSize: '16px' }}>&ldquo;{spokenTranscript}&rdquo;</strong>
                  </div>
                )}

                {voiceFeedback && (
                  <div style={{ marginTop: '12px', fontWeight: 800, color: voiceFeedback.score >= 70 ? '#1b6b35' : '#c55c35' }}>
                    {voiceFeedback.feedback} ({voiceFeedback.score}% accuracy)
                  </div>
                )}
              </div>
            )}

            {/* 2. Spelling Activity */}
            {isSpelling && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                    minHeight: '60px',
                    border: '3px dashed #172554',
                    borderRadius: '16px',
                    padding: '12px',
                    background: '#fff',
                    marginBottom: '16px',
                  }}
                >
                  {spelledWord.length === 0 && (
                    <span style={{ color: '#a0aec0', fontWeight: 800, alignSelf: 'center' }}>
                      Tap the letters below in order
                    </span>
                  )}
                  {spelledWord.map((letter, i) => (
                    <span
                      key={i}
                      style={{
                        background: '#ffd83d',
                        border: '2px solid #172554',
                        borderRadius: '10px',
                        padding: '10px 16px',
                        fontSize: '22px',
                        fontWeight: 900,
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {scrambleLetters.map((letter, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => pickLetter(letter, i)}
                      style={{
                        background: '#fff',
                        border: '3px solid #172554',
                        borderRadius: '12px',
                        padding: '12px 18px',
                        fontSize: '20px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '3px 3px 0 #172554',
                      }}
                    >
                      {letter}
                    </button>
                  ))}
                  {spelledWord.length > 0 && (
                    <button
                      type="button"
                      onClick={resetSpelling}
                      style={{ background: '#f4b29f', border: '2px solid #172554', borderRadius: '10px', padding: '6px 12px', fontWeight: 800, cursor: 'pointer' }}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 3. Sentence Builder Activity */}
            {isSentenceBuilder && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    minHeight: '60px',
                    border: '3px dashed #172554',
                    borderRadius: '16px',
                    padding: '12px',
                    background: '#fff',
                    marginBottom: '16px',
                  }}
                >
                  {builtSentence.length === 0 && (
                    <span style={{ color: '#a0aec0', fontWeight: 800, alignSelf: 'center' }}>
                      Tap words to build the sentence
                    </span>
                  )}
                  {builtSentence.map((word, i) => (
                    <span
                      key={i}
                      style={{
                        background: '#ffd83d',
                        border: '2px solid #172554',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        fontSize: '16px',
                        fontWeight: 900,
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {sentenceWords.map((word, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => pickWord(word, i)}
                      style={{
                        background: '#fff',
                        border: '3px solid #172554',
                        borderRadius: '12px',
                        padding: '10px 16px',
                        fontSize: '15px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '3px 3px 0 #172554',
                      }}
                    >
                      {word}
                    </button>
                  ))}
                  {builtSentence.length > 0 && (
                    <button
                      type="button"
                      onClick={resetSentence}
                      style={{ background: '#f4b29f', border: '2px solid #172554', borderRadius: '10px', padding: '6px 12px', fontWeight: 800, cursor: 'pointer' }}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 4. Multiple Choice & Matching Choices */}
            {!isSpeaking && !isSpelling && !isSentenceBuilder && (
              <div className="tactile-choices" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                {(activity.choices || [activity.target]).map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    className={selected === choice ? 'tactile-choice selected' : 'tactile-choice'}
                    onClick={() => {
                      setSelected(choice)
                      setPhase('playing')
                    }}
                    style={{
                      background: selected === choice ? '#ffd83d' : '#ffffff',
                      border: '3px solid #172554',
                      borderRadius: '16px',
                      padding: '16px',
                      fontSize: '16px',
                      fontWeight: 900,
                      boxShadow: selected === choice ? 'inset 3px 3px 0 #172554' : '4px 4px 0 #172554',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <strong>{choice}</strong>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action & Feedback Bars */}
          {!isSpeaking && phase !== 'correct' && (
            <button
              className="world-button primary-lesson-action"
              disabled={
                submitting ||
                (isSpelling ? spelledWord.length === 0 : isSentenceBuilder ? builtSentence.length === 0 : !selected)
              }
              type="button"
              onClick={checkAnswer}
              style={{ width: '100%', textAlign: 'center', fontSize: '16px', padding: '16px' }}
            >
              {submitting ? 'Checking answer...' : 'Show Miss Julie →'}
            </button>
          )}

          {/* Success Feedback View */}
          {phase === 'correct' && (
            <div className="context-feedback" style={{ background: '#52d273', border: '3px solid #172554', borderRadius: '18px', padding: '18px', marginTop: '20px', textAlign: 'center', color: '#172554' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}>Miss Julie says:</span>
              <h3 style={{ fontSize: '24px', margin: '4px 0' }}>Fantastic! You nailed it!</h3>
              <small style={{ fontWeight: 800, fontSize: '13px' }}>+{activity.xp || 15} XP Earned · Keep going!</small>
              <button
                className="world-button"
                type="button"
                onClick={nextStep}
                style={{ display: 'block', margin: '14px auto 0', background: '#ffd83d', color: '#172554' }}
              >
                {index === activities.length - 1 ? 'Open Final Reward 🏆' : 'Next Question →'}
              </button>
            </div>
          )}

          {/* Retry Feedback View */}
          {phase === 'retry' && !isSpeaking && (
            <div className="context-feedback gentle" style={{ background: '#f4b29f', border: '3px solid #172554', borderRadius: '18px', padding: '18px', marginTop: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}>Miss Julie says:</span>
              <h3 style={{ fontSize: '22px', margin: '4px 0' }}>Almost! Let&apos;s try again.</h3>
              <small style={{ fontWeight: 800, fontSize: '13px' }}>Clue: {activity.hint || 'Check the word carefully.'}</small>
              <button
                className="world-button"
                type="button"
                onClick={() => setPhase('playing')}
                style={{ display: 'block', margin: '14px auto 0' }}
              >
                Try Again
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
