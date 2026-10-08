"use client";

import { useEffect, useState } from "react";
import { AppSettings, DEFAULT_SETTINGS } from "@/lib/types";
import { getSettings, saveSettings, clearHistory } from "@/lib/storage";
import { waitForVoices, speak } from "@/lib/tts";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
    waitForVoices().then(setVoices);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    document.documentElement.classList.toggle("font-large", settings.largeText);
  }, [settings.theme, settings.largeText]);

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  }

  function updateVoice<K extends keyof AppSettings["voice"]>(key: K, value: AppSettings["voice"][K]) {
    const next = { ...settings, voice: { ...settings.voice, [key]: value } };
    setSettings(next);
    saveSettings(next);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:px-10">
      <h1 className="text-[22px] font-semibold tracking-tight">Settings</h1>

      <Section title="Voice">
        <Field label="Voice">
          <select
            className="input"
            value={settings.voice.voiceURI ?? ""}
            onChange={(e) => updateVoice("voiceURI", e.target.value || null)}
          >
            <option value="">System default</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </Field>
        <SliderField
          label="Speaking speed"
          value={settings.voice.rate}
          min={0.5}
          max={2}
          step={0.1}
          onChange={(v) => updateVoice("rate", v)}
        />
        <SliderField
          label="Pitch"
          value={settings.voice.pitch}
          min={0}
          max={2}
          step={0.1}
          onChange={(v) => updateVoice("pitch", v)}
        />
        <SliderField
          label="Volume"
          value={settings.voice.volume}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => updateVoice("volume", v)}
        />
        <button
          onClick={() => speak("This is what SignConnect will sound like.", settings.voice)}
          className="btn-secondary"
        >
          Test voice
        </button>
      </Section>

      <Section title="Recognition">
        <SliderField
          label="Confidence threshold"
          hint="Higher means fewer accidental triggers, but gestures must be performed more precisely."
          value={settings.globalConfidenceThreshold}
          min={0.4}
          max={0.95}
          step={0.01}
          onChange={(v) => update("globalConfidenceThreshold", v)}
        />
        <SliderField
          label="Hold duration before speaking"
          hint="How many consecutive stable frames are required before a gesture triggers speech."
          value={settings.holdFramesRequired}
          min={3}
          max={20}
          step={1}
          onChange={(v) => update("holdFramesRequired", v)}
        />
      </Section>

      <Section title="Privacy">
        <p className="text-[14px] text-muted">
          SignConnect processes your camera feed on your own device to detect hand
          position. Raw video is never stored or sent anywhere \u2014 only the phrases you
          speak and the numeric hand-shape data for gestures you choose to train are
          saved, and only on this device.
        </p>
        <label className="mt-3 flex items-center gap-2.5 text-[14px]">
          <input
            type="checkbox"
            checked={settings.historyEnabled}
            onChange={(e) => update("historyEnabled", e.target.checked)}
            className="h-4 w-4 accent-brand-500"
          />
          Keep a history of recently spoken messages
        </label>
        <button
          onClick={() => {
            clearHistory();
            setCleared(true);
            setTimeout(() => setCleared(false), 2000);
          }}
          className="btn-secondary mt-3"
        >
          {cleared ? "History cleared" : "Clear communication history"}
        </button>
      </Section>

      <Section title="Accessibility">
        <Field label="Theme">
          <select
            className="input"
            value={settings.theme}
            onChange={(e) => update("theme", e.target.value as AppSettings["theme"])}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Field>
        <label className="mt-1 flex items-center gap-2.5 text-[14px]">
          <input
            type="checkbox"
            checked={settings.largeText}
            onChange={(e) => update("largeText", e.target.checked)}
            className="h-4 w-4 accent-brand-500"
          />
          Larger text throughout the app
        </label>
        <p className="mt-3 text-[13px] text-muted">
          SignConnect also respects your operating system&apos;s reduced-motion
          preference automatically, and every control can be reached with the keyboard.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-card border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium">{label}</label>
      {children}
    </div>
  );
}

function SliderField({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[13px]">
        <span className="font-medium">{label}</span>
        <span className="text-muted">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-brand-500"
        aria-label={label}
      />
      {hint && <p className="mt-1 text-[12px] text-muted">{hint}</p>}
    </div>
  );
}
