"use client";

import { useEffect, useRef, useState } from "react";
import { X, Circle, CheckCircle2 } from "lucide-react";
import CameraFeed from "./CameraFeed";
import { useHandTracking } from "@/lib/useHandTracking";
import { extractFeatures, Landmark } from "@/lib/gestureEngine";
import { Gesture, GestureSample } from "@/lib/types";
import { uid } from "@/lib/storage";

const SAMPLES_TARGET = 12;
const CAPTURE_INTERVAL_MS = 250;

export default function GestureTrainer({
  existingGesture,
  onCancel,
  onSave,
}: {
  existingGesture?: Gesture;
  onCancel: () => void;
  onSave: (gesture: Gesture) => void;
}) {
  const [name, setName] = useState(existingGesture?.name ?? "");
  const [phrase, setPhrase] = useState(existingGesture?.spokenPhrase ?? "");
  const [step, setStep] = useState<"details" | "train">(existingGesture ? "train" : "details");
  const [samples, setSamples] = useState<GestureSample[]>([]);
  const [recording, setRecording] = useState(false);
  const cameraActive = step === "train";
  const { videoRef, status, errorMessage, landmarks } = useHandTracking(cameraActive);
  const captureTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestLandmarksRef = useRef<Landmark[] | null>(null);

  useEffect(() => {
    latestLandmarksRef.current = landmarks;
  }, [landmarks]);

  useEffect(() => {
    if (!recording) {
      if (captureTimer.current) {
        clearInterval(captureTimer.current);
        captureTimer.current = null;
      }
      return;
    }

    captureTimer.current = setInterval(() => {
      const currentLandmarks = latestLandmarksRef.current;
      if (!currentLandmarks) return;

      setSamples((prev) => {
        if (prev.length >= SAMPLES_TARGET) {
          if (captureTimer.current) {
            clearInterval(captureTimer.current);
            captureTimer.current = null;
          }
          return prev;
        }

        const vector = extractFeatures(currentLandmarks);
        return [...prev, { id: uid(), vector, createdAt: new Date().toISOString() }];
      });
    }, CAPTURE_INTERVAL_MS);

    return () => {
      if (captureTimer.current) {
        clearInterval(captureTimer.current);
        captureTimer.current = null;
      }
    };
  }, [recording]);

  useEffect(() => {
    if (samples.length >= SAMPLES_TARGET) setRecording(false);
  }, [samples.length]);

  const canProceed = name.trim().length > 0 && phrase.trim().length > 0;
  const ready = samples.length >= SAMPLES_TARGET;

  function handleSave() {
    const now = new Date().toISOString();
    onSave({
      id: existingGesture?.id ?? uid(),
      name: name.trim(),
      spokenPhrase: phrase.trim(),
      samples,
      confidenceThreshold: existingGesture?.confidenceThreshold ?? 0.72,
      enabled: existingGesture?.enabled ?? true,
      createdAt: existingGesture?.createdAt ?? now,
      updatedAt: now,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-surface p-6 dark:bg-surface-dark">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold">
            {existingGesture ? "Retrain gesture" : "Create gesture"}
          </h2>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-canvas dark:hover:bg-canvas-dark"
          >
            <X size={18} />
          </button>
        </div>

        {step === "details" && (
          <div className="space-y-4">
            <Field label="Gesture name" htmlFor="gesture-name">
              <input
                id="gesture-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Need Help"
                className="input"
              />
            </Field>
            <Field label="Spoken phrase" htmlFor="gesture-phrase">
              <input
                id="gesture-phrase"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder="I need help"
                className="input"
              />
            </Field>
            <p className="text-[13px] text-muted">
              Next, you&apos;ll perform this gesture in front of your camera a few times so
              SignConnect can learn what it looks like.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={onCancel} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => setStep("train")}
                disabled={!canProceed}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === "train" && (
          <div className="space-y-4">
            <CameraFeed
              videoRef={videoRef}
              status={status}
              errorMessage={errorMessage}
              landmarks={landmarks}
            />
            <p className="text-[13px] text-muted">
              Hold your hand steady inside the camera area, form the &ldquo;{name || "gesture"}&rdquo;
              shape, then press and hold Record while you gently vary the angle a little \u2014
              this helps recognition work from different positions.
            </p>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-[13px]">
                <span className="font-medium">Training samples</span>
                <span className="text-muted">{samples.length} / {SAMPLES_TARGET}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-canvas dark:bg-canvas-dark">
                <div
                  className="h-full bg-brand-500 transition-[width]"
                  style={{ width: `${Math.min(100, (samples.length / SAMPLES_TARGET) * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-[13px]">
                {ready ? (
                  <>
                    <CheckCircle2 size={15} className="text-good" aria-hidden="true" /> Ready to save
                  </>
                ) : (
                  <span className="text-muted">Status: {recording ? "Recording\u2026" : "Not started"}</span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap justify-between gap-2 pt-2">
              <button
                onClick={() => setSamples([])}
                disabled={samples.length === 0}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear samples
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setRecording((r) => !r)}
                  disabled={status !== "ready" && !recording || ready}
                  className={`btn-primary flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <Circle size={12} className={recording ? "fill-white" : "fill-transparent"} aria-hidden="true" />
                  {recording ? "Stop recording" : "Record"}
                </button>
                <button onClick={handleSave} disabled={!ready} className="btn-primary disabled:cursor-not-allowed disabled:opacity-40">
                  Save gesture
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
