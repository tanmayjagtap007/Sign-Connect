// Core data model. Mirrors the schema in the product spec, adapted for
// client-side (localStorage) persistence in the MVP. Swapping this for a
// real database later just means changing lib/storage.ts.

export interface GestureSample {
  id: string;
  /** Normalized 63-dim feature vector (21 landmarks * x,y,z), wrist-relative and scale-normalized. */
  vector: number[];
  createdAt: string;
}

export interface Gesture {
  id: string;
  name: string;
  spokenPhrase: string;
  samples: GestureSample[];
  confidenceThreshold: number; // 0-1, overrides global default if set
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuickPhrase {
  id: string;
  text: string;
  enabled: boolean;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  phrase: string;
  gestureId?: string;
  source: "gesture" | "quick-phrase";
  timestamp: string;
}

export interface VoiceSettings {
  voiceURI: string | null;
  rate: number; // 0.5 - 2
  pitch: number; // 0 - 2
  volume: number; // 0 - 1
}

export interface AppSettings {
  voice: VoiceSettings;
  globalConfidenceThreshold: number; // 0-1
  holdFramesRequired: number; // temporal smoothing window
  cooldownMs: number; // debounce after a phrase is spoken
  historyEnabled: boolean;
  theme: "light" | "dark" | "system";
  largeText: boolean;
  reducedMotion: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  voice: { voiceURI: null, rate: 1, pitch: 1, volume: 1 },
  globalConfidenceThreshold: 0.72,
  holdFramesRequired: 8,
  cooldownMs: 1800,
  historyEnabled: true,
  theme: "light",
  largeText: false,
  reducedMotion: false,
};
