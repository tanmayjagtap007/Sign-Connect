"use client";

import { useEffect, useState } from "react";
import CameraFeed from "@/components/CameraFeed";
import { useHandTracking } from "@/lib/useHandTracking";
import { useGestureClassifier, RecognizedPhrase } from "@/lib/useGestureClassifier";
import { getGestures, getPhrases, getSettings, addHistoryEntry } from "@/lib/storage";
import { AppSettings, Gesture, QuickPhrase } from "@/lib/types";
import { speak } from "@/lib/tts";
import { Video, VideoOff } from "lucide-react";

export default function CommunicationPage() {
  const [cameraOn, setCameraOn] = useState(false);
  const [gestures, setGestures] = useState<Gesture[]>([]);
  const [phrases, setPhrases] = useState<QuickPhrase[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [recent, setRecent] = useState<RecognizedPhrase[]>([]);

  useEffect(() => {
    setGestures(getGestures());
    setPhrases(getPhrases());
    setSettings(getSettings());
  }, []);

  const { videoRef, status, errorMessage, landmarks } = useHandTracking(cameraOn);
  const { liveMatch } = useGestureClassifier(landmarks, gestures, settings, (r) =>
    setRecent((prev) => [r, ...prev].slice(0, 8))
  );

  function triggerQuickPhrase(phrase: QuickPhrase) {
    speak(phrase.text, settings.voice);
    addHistoryEntry({
      phrase: phrase.text,
      source: "quick-phrase",
      timestamp: new Date().toISOString(),
    });
    setRecent((prev) =>
      [
        {
          gestureId: "",
          gestureName: "Quick phrase",
          phrase: phrase.text,
          confidence: 1,
          at: Date.now(),
        },
        ...prev,
      ].slice(0, 8)
    );
  }

  const activeGestureCount = gestures.filter((g) => g.enabled && g.samples.length > 0).length;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:px-10 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold tracking-tight">Communication</h1>
          <button
            onClick={() => setCameraOn((v) => !v)}
            className={cameraOn ? "btn-secondary flex items-center gap-2" : "btn-primary flex items-center gap-2"}
          >
            {cameraOn ? <VideoOff size={16} /> : <Video size={16} />}
            {cameraOn ? "Stop camera" : "Enable camera"}
          </button>
        </div>

        {activeGestureCount === 0 && (
          <p className="mt-2 text-[14px] text-muted">
            You don&apos;t have any trained gestures yet \u2014 use the quick phrases on the right,
            or head to My Gestures to teach SignConnect one.
          </p>
        )}

        <div className="mt-4">
          {cameraOn ? (
            <CameraFeed videoRef={videoRef} status={status} errorMessage={errorMessage} landmarks={landmarks} />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-card border border-dashed border-border text-[14px] text-muted dark:border-border-dark">
              Camera is off. Enable it to start recognizing gestures.
            </div>
          )}
        </div>

        <div className="mt-4 rounded-card border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
          <p className="text-[13px] text-muted">Detected</p>
          <p className="mt-0.5 text-[18px] font-semibold">
            {liveMatch ? liveMatch.name : "\u2014"}
          </p>
          <p aria-live="polite" className="mt-2 flex items-center gap-1.5 text-[13px] text-muted">
            <span
              className={`h-2 w-2 rounded-full ${status === "ready" ? "bg-good" : "bg-border"}`}
              aria-hidden="true"
            />
            {cameraOn ? (status === "ready" ? "Ready" : "Waiting for a clear hand view") : "Camera off"}
          </p>
        </div>

        <div className="mt-6">
          <h2 className="text-[15px] font-semibold">Recent messages</h2>
          {recent.length === 0 ? (
            <p className="mt-2 text-[14px] text-muted">Nothing said yet this session.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {recent.map((r, i) => (
                <li
                  key={`${r.at}-${i}`}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-[14px] dark:border-border-dark dark:bg-surface-dark"
                >
                  &ldquo;{r.phrase}&rdquo;
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <aside>
        <h2 className="text-[15px] font-semibold">Quick phrases</h2>
        <p className="mt-1 text-[13px] text-muted">
          Tap any phrase to speak it immediately, without a gesture.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {phrases
            .filter((p) => p.enabled)
            .map((phrase) => (
              <button
                key={phrase.id}
                onClick={() => triggerQuickPhrase(phrase)}
                className="rounded-lg border border-border bg-surface px-3 py-2.5 text-left text-[14px] font-medium hover:bg-brand-50 dark:border-border-dark dark:bg-surface-dark dark:hover:bg-brand-700/20"
              >
                {phrase.text}
              </button>
            ))}
        </div>
      </aside>
    </div>
  );
}
