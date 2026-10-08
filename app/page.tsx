"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getGestures, getPhrases } from "@/lib/storage";
import { CheckCircle2, ArrowRight, Hand, MessageSquareText, Video } from "lucide-react";

export default function DashboardPage() {
  const [gestureCount, setGestureCount] = useState(0);
  const [phraseCount, setPhraseCount] = useState(0);

  useEffect(() => {
    setGestureCount(getGestures().filter((g) => g.enabled).length);
    setPhraseCount(getPhrases().filter((p) => p.enabled).length);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:px-10">
      <p className="text-[15px] text-muted">{greeting}</p>
      <h1 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight">
        Communicate without barriers.
      </h1>
      <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-muted">
        SignConnect converts your own hand gestures into spoken words, so people who
        don&apos;t know sign language can understand you in real time.
      </p>

      <Link
        href="/communication"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-[15px] font-medium text-white hover:bg-brand-600"
      >
        Start Communication
        <ArrowRight size={16} aria-hidden="true" />
      </Link>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Video size={18} aria-hidden="true" />}
          label="Camera"
          value="Available on Communication screen"
        />
        <StatCard
          icon={<Hand size={18} aria-hidden="true" />}
          label="Your gestures"
          value={`${gestureCount} active`}
          href="/gestures"
        />
        <StatCard
          icon={<MessageSquareText size={18} aria-hidden="true" />}
          label="Quick phrases"
          value={`${phraseCount} available`}
          href="/phrases"
        />
      </div>

      <div className="mt-8 rounded-card border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark">
        <h2 className="text-[15px] font-semibold">Getting started</h2>
        <ol className="mt-3 space-y-2.5 text-[14px] text-muted">
          <Step done={gestureCount > 0}>
            Create your first gesture in{" "}
            <Link href="/gestures" className="text-brand-600 underline underline-offset-2">
              My Gestures
            </Link>
          </Step>
          <Step done={false}>
            Open{" "}
            <Link href="/communication" className="text-brand-600 underline underline-offset-2">
              Communication
            </Link>{" "}
            and try it in front of your camera
          </Step>
          <Step done={false}>
            Review your{" "}
            <Link href="/settings" className="text-brand-600 underline underline-offset-2">
              voice and privacy settings
            </Link>
          </Step>
        </ol>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-card border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-[13px]">{label}</span>
      </div>
      <p className="mt-1.5 text-[15px] font-medium">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function Step({ children, done }: { children: React.ReactNode; done: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckCircle2
        size={17}
        className={done ? "text-good" : "text-border"}
        aria-hidden="true"
      />
      <span>{children}</span>
    </li>
  );
}
