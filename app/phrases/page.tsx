"use client";

import { useEffect, useState } from "react";
import { QuickPhrase } from "@/lib/types";
import { getPhrases, savePhrases, uid, getSettings } from "@/lib/storage";
import { speak } from "@/lib/tts";
import { Plus, Trash2, Volume2 } from "lucide-react";

export default function PhrasesPage() {
  const [phrases, setPhrases] = useState<QuickPhrase[]>([]);
  const [newText, setNewText] = useState("");

  useEffect(() => {
    setPhrases(getPhrases());
  }, []);

  function persist(next: QuickPhrase[]) {
    setPhrases(next);
    savePhrases(next);
  }

  function addPhrase() {
    const text = newText.trim();
    if (!text) return;
    persist([...phrases, { id: uid(), text, enabled: true, createdAt: new Date().toISOString() }]);
    setNewText("");
  }

  function removePhrase(id: string) {
    persist(phrases.filter((p) => p.id !== id));
  }

  function toggleEnabled(id: string) {
    persist(phrases.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:px-10">
      <h1 className="text-[22px] font-semibold tracking-tight">Quick Phrases</h1>
      <p className="mt-1 text-[14px] text-muted">
        Phrases you can speak instantly with one tap, without needing a gesture.
      </p>

      <div className="mt-6 flex gap-2">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addPhrase()}
          placeholder="Add a phrase, e.g. \u201cLet's take a short break\u201d"
          className="input"
          aria-label="New quick phrase"
        />
        <button onClick={addPhrase} className="btn-primary flex shrink-0 items-center gap-1.5">
          <Plus size={16} aria-hidden="true" />
          Add
        </button>
      </div>

      <ul className="mt-5 space-y-2">
        {phrases.map((phrase) => (
          <li
            key={phrase.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3.5 py-2.5 dark:border-border-dark dark:bg-surface-dark"
          >
            <label className="flex flex-1 items-center gap-3 text-[14px]">
              <input
                type="checkbox"
                checked={phrase.enabled}
                onChange={() => toggleEnabled(phrase.id)}
                className="h-4 w-4 accent-brand-500"
                aria-label={`Enable ${phrase.text}`}
              />
              <span className={phrase.enabled ? "" : "text-muted line-through"}>{phrase.text}</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => speak(phrase.text, getSettings().voice)}
                aria-label={`Test speak ${phrase.text}`}
                className="rounded-md p-1.5 text-muted hover:bg-canvas dark:hover:bg-canvas-dark"
              >
                <Volume2 size={16} />
              </button>
              <button
                onClick={() => removePhrase(phrase.id)}
                aria-label={`Delete ${phrase.text}`}
                className="rounded-md p-1.5 text-bad hover:bg-canvas dark:hover:bg-canvas-dark"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
