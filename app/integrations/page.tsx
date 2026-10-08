import { Video, Copy } from "lucide-react";

const PLATFORMS = [
  { name: "Zoom", status: "planned" as const },
  { name: "Google Meet", status: "planned" as const },
  { name: "Microsoft Teams", status: "planned" as const },
];

export default function IntegrationsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:px-10">
      <h1 className="text-[22px] font-semibold tracking-tight">Meeting Integrations</h1>
      <p className="mt-1 text-[14px] text-muted">
        Direct integration with meeting platforms is planned for a later release.
      </p>

      <div className="mt-6 rounded-card border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark">
        <h2 className="text-[15px] font-semibold">Why this isn&apos;t automatic yet</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          Zoom, Google Meet, and Teams don&apos;t offer a supported way for a web app to
          speak into a call directly. Building this properly means routing SignConnect&apos;s
          speech through a virtual audio device or a platform-approved app/bot integration
          &mdash; real engineering work, not a toggle. Rather than fake a &ldquo;connected&rdquo;
          state, this page is honest about what works today.
        </p>
      </div>

      <div className="mt-6 rounded-card border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark">
        <h2 className="text-[15px] font-semibold">What works right now</h2>
        <ul className="mt-2 space-y-2 text-[14px] text-muted">
          <li className="flex items-start gap-2">
            <Video size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            Keep the Communication screen open in a window alongside your meeting; SignConnect
            speaks aloud through your system speakers, which your meeting&apos;s microphone can
            pick up if you enable &ldquo;stereo mix&rdquo; style audio routing, or a virtual
            audio cable, in your OS sound settings.
          </li>
          <li className="flex items-start gap-2">
            <Copy size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            Use the meeting&apos;s chat panel to paste a spoken phrase as text when audio
            routing isn&apos;t set up.
          </li>
        </ul>
      </div>

      <div className="mt-6 space-y-3">
        {PLATFORMS.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-between rounded-card border border-border bg-surface px-4 py-3.5 dark:border-border-dark dark:bg-surface-dark"
          >
            <span className="text-[14px] font-medium">{p.name}</span>
            <span className="flex items-center gap-1.5 text-[13px] text-muted">
              <span className="h-2 w-2 rounded-full bg-border" aria-hidden="true" />
              Planned
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
