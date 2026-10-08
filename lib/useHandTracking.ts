"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadHandLandmarker, Landmark } from "./gestureEngine";

export type CameraStatus =
  | "idle"
  | "requesting-model"
  | "requesting-camera"
  | "ready"
  | "no-hand"
  | "camera-error"
  | "model-error";

interface UseHandTrackingResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  errorMessage: string | null;
  landmarks: Landmark[] | null;
  start: () => void;
  stop: () => void;
}

/**
 * Owns the webcam stream and the per-frame MediaPipe detection loop.
 * All inference happens on-device; no video frame is ever sent to a server.
 */
export function useHandTracking(active: boolean): UseHandTrackingResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
    setLandmarks(null);
  }, []);

  const start = useCallback(() => {
    let cancelled = false;

    (async () => {
      setStatus("requesting-model");
      setErrorMessage(null);
      let landmarker;
      try {
        landmarker = await loadHandLandmarker();
      } catch (err) {
        if (cancelled) return;
        setStatus("model-error");
        setErrorMessage(
          "We couldn't load the hand-tracking model. Check your internet connection and try again."
        );
        return;
      }

      setStatus("requesting-camera");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        if (cancelled) return;
        setStatus("camera-error");
        setErrorMessage(
          "We can't access your camera. Check your browser permissions and try again."
        );
        return;
      }

      setStatus("no-hand");

      const detect = () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) {
          rafRef.current = requestAnimationFrame(detect);
          return;
        }
        const result = landmarker!.detectForVideo(video, performance.now());
        if (result.landmarks && result.landmarks.length > 0) {
          setLandmarks(result.landmarks[0] as Landmark[]);
          setStatus("ready");
        } else {
          setLandmarks(null);
          setStatus("no-hand");
        }
        rafRef.current = requestAnimationFrame(detect);
      };
      rafRef.current = requestAnimationFrame(detect);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (active) {
      const cancel = start();
      return () => {
        cancel();
        stop();
      };
    }
    stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return { videoRef, status, errorMessage, landmarks, start, stop };
}
