"use client";

import { useEffect, useState } from "react";
import { Gesture } from "@/lib/types";
import { deleteGesture, getGestures, upsertGesture } from "@/lib/storage";
import GestureTrainer from "@/components/GestureTrainer";
import { Hand, Plus, Pencil, RotateCcw, Trash2, Volume2 } from "lucide-react";
import { speak } from "@/lib/tts";
import { getSettings } from "@/lib/storage";

export default function GesturesPage() {
  const [gestures, setGestures] = useState<Gesture[]>([]);
  const [editing, setEditing] = useState<Gesture | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Gesture | null>(null);

  useEffect(() => {
    setGestures(getGestures());
  }, []);

  function handleSave(gesture: Gesture) {
    setGestures(upsertGesture(gesture));
    setEditing(null);
  }

  function handleDelete(gesture: Gesture) {
    setGestures(deleteGesture(gesture.id));
    setConfirmDelete(null);
  }

  function toggleEnabled(gesture: Gesture) {
    setGestures(upsertGesture({ ...gesture, enabled: !gesture.enabled }));
  }

  function testGesture(gesture: Gesture) {
    speak(gesture.spokenPhrase, getSettings().voice);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">My Gestures</h1>
          <p className="mt-1 text-[14px] text-muted">
            Gestures you&apos;ve taught SignConnect, and the phrase each one speaks.
          </p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus size={16} aria-hidden="true" />
          Create gesture
        </button>
      </div>

      {gestures.length === 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-border p-10 text-center dark:border-border-dark">
          <Hand size={28} className="mx-auto text-muted" aria-hidden="true" />
          <p className="mt-3 text-[15px] font-medium">No gestures yet</p>
          <p className="mt-1 text-[14px] text-muted">
            Create your first gesture to start turning it into speech.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gestures.map((gesture) => (
            <div
              key={gesture.id}
              className="rounded-card border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-700/20 dark:text-brand-200">
                <Hand size={18} aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-[15px] font-semibold">{gesture.name}</h3>
              <p className="mt-0.5 text-[14px] text-muted">&ldquo;{gesture.spokenPhrase}&rdquo;</p>
              <button
                onClick={() => toggleEnabled(gesture)}
                className="mt-2 flex items-center gap-1.5 text-[13px]"
                aria-pressed={gesture.enabled}
              >
                <span
                  className={`h-2 w-2 rounded-full ${gesture.enabled ? "bg-good" : "bg-border"}`}
                  aria-hidden="true"
                />
                {gesture.enabled ? "Active" : "Disabled"}
              </button>

              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3 text-[13px] dark:border-border-dark">
                <IconAction icon={<Pencil size={14} />} label="Edit" onClick={() => setEditing(gesture)} />
                <IconAction icon={<Volume2 size={14} />} label="Test" onClick={() => testGesture(gesture)} />
                <IconAction icon={<RotateCcw size={14} />} label="Retrain" onClick={() => setEditing(gesture)} />
                <IconAction
                  icon={<Trash2 size={14} />}
                  label="Delete"
                  onClick={() => setConfirmDelete(gesture)}
                  danger
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <GestureTrainer
          existingGesture={editing === "new" ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-card bg-surface p-6 dark:bg-surface-dark">
            <h2 className="text-[16px] font-semibold">Delete &ldquo;{confirmDelete.name}&rdquo;?</h2>
            <p className="mt-1.5 text-[14px] text-muted">
              This removes the gesture and its training data. This can&apos;t be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="rounded-lg bg-bad px-4 py-2.5 text-[14px] font-medium text-white hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IconAction({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-canvas dark:hover:bg-canvas-dark ${
        danger ? "text-bad" : "text-muted"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
