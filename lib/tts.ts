"use client";

import { VoiceSettings } from "./types";

export function getVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

/** Voices load asynchronously in some browsers; resolves once the list is populated. */
export function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = getVoices();
    if (existing.length) return resolve(existing);
    if (typeof window === "undefined" || !window.speechSynthesis) return resolve([]);
    window.speechSynthesis.onvoiceschanged = () => resolve(getVoices());
    // Fallback in case the event never fires
    setTimeout(() => resolve(getVoices()), 1000);
  });
}

let lastSpoken = "";
let lastSpokenAt = 0;

/**
 * Speaks a phrase, guarding against re-speaking the exact same phrase within
 * a short window (e.g. because a gesture is being held) independent of the
 * caller's own cooldown/debounce logic.
 */
export function speak(text: string, settings: VoiceSettings) {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;

  const now = Date.now();
  if (text === lastSpoken && now - lastSpokenAt < 1200) return false;
  lastSpoken = text;
  lastSpokenAt = now;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;
  utterance.volume = settings.volume;
  if (settings.voiceURI) {
    const voice = getVoices().find((v) => v.voiceURI === settings.voiceURI);
    if (voice) utterance.voice = voice;
  }
  window.speechSynthesis.speak(utterance);
  return true;
}
