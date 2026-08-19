export function findFemaleEnglishVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices()
  const femaleMarkers = /female|samantha|karen|moira|victoria|zira|jenny|aria|ava|sonia|natasha|tessa|fiona|hazel|serena|susan|linda|heera|veena|priya/i
  const maleMarkers = /male|david|mark|george|guy|daniel|james|richard|ryan|alex|andrew/i

  const ranked = voices
    .filter((voice) => /^en(-|_)(US|GB|AU|IN)?/i.test(voice.lang))
    .map((voice) => {
      const name = voice.name
      let score = 0
      if (femaleMarkers.test(name)) score += 100
      if (/natural|neural|online/i.test(name)) score += 15
      if (/en(-|_)(US|IN)/i.test(voice.lang)) score += 8
      if (maleMarkers.test(name)) score -= 200
      return { voice, score }
    })
    .sort((a, b) => b.score - a.score)

  // Do not silently choose an explicitly male browser voice. On Windows this
  // normally resolves to Microsoft Zira/Aria/Jenny; other platforms use their
  // female English equivalent when available.
  return ranked.find(({ score }) => score > 0)?.voice ?? null
}

export function speakAsMissJulie(text: string, rate = 0.86) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = rate
  utterance.pitch = 1.18
  utterance.volume = 1
  const voice = findFemaleEnglishVoice()
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
  return true
}
