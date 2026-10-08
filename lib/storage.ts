"use client";

import {
  AppSettings,
  DEFAULT_SETTINGS,
  Gesture,
  HistoryEntry,
  QuickPhrase,
} from "./types";

// All persistence lives in the browser's localStorage. Nothing here ever
// stores raw camera frames or video — only numeric hand-landmark vectors,
// text phrases, and settings. This keeps SignConnect privacy-first by
// construction: there is no video to leak because none is ever written.

const KEYS = {
  gestures: "signconnect.gestures.v1",
  phrases: "signconnect.phrases.v1",
  history: "signconnect.history.v1",
  settings: "signconnect.settings.v1",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// ---- Gestures ----
export const getGestures = (): Gesture[] => read(KEYS.gestures, []);
export const saveGestures = (gestures: Gesture[]) =>
  write(KEYS.gestures, gestures);

export const upsertGesture = (gesture: Gesture) => {
  const all = getGestures();
  const idx = all.findIndex((g) => g.id === gesture.id);
  if (idx >= 0) all[idx] = gesture;
  else all.push(gesture);
  saveGestures(all);
  return all;
};

export const deleteGesture = (id: string) => {
  const all = getGestures().filter((g) => g.id !== id);
  saveGestures(all);
  return all;
};

// ---- Quick phrases ----
const DEFAULT_PHRASES: QuickPhrase[] = [
  "Hello",
  "Yes",
  "No",
  "Thank you",
  "Please wait",
  "I have a question",
  "Can you repeat that?",
  "I need help",
  "One moment please",
].map((text) => ({ id: uid(), text, enabled: true, createdAt: new Date().toISOString() }));

export const getPhrases = (): QuickPhrase[] => {
  const existing = read<QuickPhrase[] | null>(KEYS.phrases, null);
  if (existing && existing.length) return existing;
  write(KEYS.phrases, DEFAULT_PHRASES);
  return DEFAULT_PHRASES;
};
export const savePhrases = (phrases: QuickPhrase[]) => write(KEYS.phrases, phrases);

// ---- History ----
export const getHistory = (): HistoryEntry[] => read(KEYS.history, []);
export const addHistoryEntry = (entry: Omit<HistoryEntry, "id">) => {
  const settings = getSettings();
  if (!settings.historyEnabled) return getHistory();
  const all = [{ ...entry, id: uid() }, ...getHistory()].slice(0, 200);
  write(KEYS.history, all);
  return all;
};
export const clearHistory = () => write(KEYS.history, []);

// ---- Settings ----
export const getSettings = (): AppSettings => read(KEYS.settings, DEFAULT_SETTINGS);
export const saveSettings = (settings: AppSettings) => write(KEYS.settings, settings);
