"use client";

import { useEffect, useRef } from "react";
import { CameraStatus } from "@/lib/useHandTracking";
import { Landmark } from "@/lib/gestureEngine";
import { CameraOff, ScanEye } from "lucide-react";

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

function statusMessage(status: CameraStatus, errorMessage: string | null) {
  switch (status) {
    case "requesting-model":
      return { title: "Loading gesture recognition\u2026", tone: "info" as const };
    case "requesting-camera":
      return { title: "Requesting camera access\u2026", tone: "info" as const };
    case "camera-error":
      return {
        title: "We can't access your camera.",
        detail: errorMessage ?? "Check your browser permissions and try again.",
        tone: "error" as const,
      };
    case "model-error":
      return {
        title: "Gesture recognition isn't available.",
        detail: errorMessage ?? "Check your internet connection and try again.",
        tone: "error" as const,
      };
    case "no-hand":
      return { title: "No hand detected", detail: "Place your hand inside the camera area.", tone: "info" as const };
    default:
      return null;
  }
}

export default function CameraFeed({
  videoRef,
  status,
  errorMessage,
  landmarks,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  errorMessage: string | null;
  landmarks: Landmark[] | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks) return;

    ctx.strokeStyle = "#7C86F2";
    ctx.lineWidth = 3;
    for (const [a, b] of CONNECTIONS) {
      const p1 = landmarks[a];
      const p2 = landmarks[b];
      ctx.beginPath();
      ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
      ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
      ctx.stroke();
    }
    ctx.fillStyle = "#4F55D6";
    for (const lm of landmarks) {
      ctx.beginPath();
      ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [landmarks, videoRef]);

  const message = statusMessage(status, errorMessage);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-card border border-border bg-ink dark:border-border-dark">
      <video
        ref={videoRef}
        className="h-full w-full -scale-x-100 object-cover"
        muted
        playsInline
        aria-label="Live camera preview"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full -scale-x-100"
        aria-hidden="true"
      />
      {message && (
        <div
          role="status"
          className={`absolute inset-x-0 bottom-0 flex items-center gap-2 px-4 py-3 text-[14px] text-white ${
            message.tone === "error" ? "bg-bad/90" : "bg-black/55"
          }`}
        >
          {message.tone === "error" ? (
            <CameraOff size={16} aria-hidden="true" />
          ) : (
            <ScanEye size={16} aria-hidden="true" />
          )}
          <span>
            <span className="font-medium">{message.title}</span>
            {message.detail ? ` ${message.detail}` : ""}
          </span>
        </div>
      )}
    </div>
  );
}
