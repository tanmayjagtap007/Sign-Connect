"use client";

import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { Gesture } from "./types";

// --- Hand landmark model loading -------------------------------------------------
//
// Uses Google's MediaPipe Tasks Vision (the actively-maintained successor to
// the old @mediapipe/hands package). Inference runs entirely on-device
// (WASM, optionally GPU-accelerated) — no camera frame ever leaves the
// browser. The wasm runtime and model weights are fetched once from
// MediaPipe's CDN and then cached by the browser.

let landmarkerPromise: Promise<HandLandmarker> | null = null;

export function loadHandLandmarker(): Promise<HandLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const fileset = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      return HandLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });
    })();
  }
  return landmarkerPromise;
}

export type Landmark = { x: number; y: number; z: number };

// --- Feature extraction -----------------------------------------------------------
//
// Raw landmarks are in normalized image coordinates, which change with hand
// position and distance from the camera. To recognize the *shape* of a
// gesture regardless of where the hand is, we re-center every landmark on
// the wrist (landmark 0) and scale by the wrist-to-middle-finger-MCP
// distance, producing a translation- and scale-invariant 63-dim vector.

export function extractFeatures(landmarks: Landmark[]): number[] {
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  const scale =
    Math.hypot(
      middleMcp.x - wrist.x,
      middleMcp.y - wrist.y,
      middleMcp.z - wrist.z
    ) || 1;

  const features: number[] = [];
  for (const lm of landmarks) {
    features.push((lm.x - wrist.x) / scale);
    features.push((lm.y - wrist.y) / scale);
    features.push((lm.z - wrist.z) / scale);
  }
  return features;
}

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

// Wrist-relative/scale-normalized landmark distances between repeats of the
// same gesture are typically a fraction of 1.0. Map that distance to a
// confidence score without making the default threshold overly strict for
// normal webcam movement.
function distanceToConfidence(distance: number): number {
  return 1 / (1 + distance);
}

export interface ClassificationResult {
  gestureId: string;
  gestureName: string;
  confidence: number;
}

/**
 * Nearest-neighbor classification across every stored sample of every
 * enabled gesture. Returns the best match, or null if nothing clears the
 * gesture's own confidence threshold.
 */
export function classifyGesture(
  liveVector: number[],
  gestures: Gesture[]
): ClassificationResult | null {
  let best: ClassificationResult | null = null;

  for (const gesture of gestures) {
    if (!gesture.enabled || gesture.samples.length === 0) continue;
    let minDistance = Infinity;
    for (const sample of gesture.samples) {
      const d = euclideanDistance(liveVector, sample.vector);
      if (d < minDistance) minDistance = d;
    }
    const confidence = distanceToConfidence(minDistance);
    if (
      confidence >= gesture.confidenceThreshold &&
      (!best || confidence > best.confidence)
    ) {
      best = { gestureId: gesture.id, gestureName: gesture.name, confidence };
    }
  }
  return best;
}
