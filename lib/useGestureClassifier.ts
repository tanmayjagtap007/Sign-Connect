"use client";

import { useEffect, useRef, useState } from "react";
import { Landmark, classifyGesture, extractFeatures } from "./gestureEngine";
import { AppSettings, Gesture } from "./types";
import { speak } from "./tts";
import { addHistoryEntry } from "./storage";

export interface RecognizedPhrase {
  gestureId: string;
  gestureName: string;
  phrase: string;
  confidence: number;
  at: number;
}

/**
 * Implements the recognition pipeline described in the spec:
 *   landmarks -> classify -> require N stable consecutive frames above
 *   threshold -> speak -> cooldown -> require the gesture to disappear (or
 *   change) before it can trigger again.
 * This prevents both single-frame false positives and repeated speech while
 * a gesture is held.
 */
export function useGestureClassifier(
  landmarks: Landmark[] | null,
  gestures: Gesture[],
  settings: AppSettings,
  onSpoken?: (r: RecognizedPhrase) => void
) {
  const [liveMatch, setLiveMatch] = useState<{ name: string; confidence: number } | null>(null);
  const streakRef = useRef<{ id: string; count: number } | null>(null);
  const cooldownByGestureRef = useRef<Record<string, number>>({});
  const lastTriggeredIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!landmarks) {
      streakRef.current = null;
      lastTriggeredIdRef.current = null;
      setLiveMatch(null);
      return;
    }

    const vector = extractFeatures(landmarks);
    const match = classifyGesture(vector, gestures);
    setLiveMatch(match ? { name: match.gestureName, confidence: match.confidence } : null);

    if (!match) {
      streakRef.current = null;
      lastTriggeredIdRef.current = null;
      return;
    }

    // A different gesture than the one currently being held resets the streak
    // and clears the previously triggered lock so switching gestures works
    // without waiting for the hand to disappear entirely.
    if (streakRef.current?.id === match.gestureId) {
      streakRef.current.count += 1;
    } else {
      streakRef.current = { id: match.gestureId, count: 1 };
    }

    if (lastTriggeredIdRef.current && lastTriggeredIdRef.current !== match.gestureId) {
      lastTriggeredIdRef.current = null;
    }

    const now = performance.now();
    const stable = streakRef.current.count >= settings.holdFramesRequired;
    const gestureCooldownUntil = cooldownByGestureRef.current[match.gestureId] ?? 0;
    const offCooldown = now >= gestureCooldownUntil;
    const gesture = gestures.find((g) => g.id === match.gestureId);
    const alreadyTriggered = lastTriggeredIdRef.current === match.gestureId;

    if (stable && offCooldown && !alreadyTriggered && gesture) {
      const spoke = speak(gesture.spokenPhrase, settings.voice);
      if (spoke) {
        cooldownByGestureRef.current[gesture.id] = now + settings.cooldownMs;
        lastTriggeredIdRef.current = match.gestureId;
        addHistoryEntry({
          phrase: gesture.spokenPhrase,
          gestureId: gesture.id,
          source: "gesture",
          timestamp: new Date().toISOString(),
        });
        onSpoken?.({
          gestureId: gesture.id,
          gestureName: gesture.name,
          phrase: gesture.spokenPhrase,
          confidence: match.confidence,
          at: Date.now(),
        });
      }
    }
  }, [landmarks, gestures, settings]);

  return { liveMatch };
}
