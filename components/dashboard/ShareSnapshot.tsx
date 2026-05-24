"use client";

import { useState, useTransition } from "react";

type CreateShareSnapshotResponse =
  | { publicId: string; url: string }
  | { status: "error"; message: string };

export function ShareSnapshot() {
  const [isPending, startTransition] = useTransition();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleCreate() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/share-snapshots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const result: CreateShareSnapshotResponse = await res.json();

        if ("publicId" in result) {
          setShareUrl(result.url);
          setError(null);
        } else {
          setError(result.message || "Failed to create snapshot");
        }
      } catch {
        setError("Something went wrong. Try again.");
      }
    });
  }

  function handleCopy() {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (shareUrl) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-400">Your snapshot is ready:</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate rounded-xl border border-cyan-700 bg-cyan-950/50 px-4 py-2 font-mono text-sm text-cyan-300 hover:bg-cyan-950"
          >
            {shareUrl}
          </a>
          <button
            onClick={handleCopy}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={() => setShareUrl(null)}
            className="text-sm text-slate-500 hover:text-slate-300"
          >
            Clear
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleCreate}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-xl border border-cyan-700 bg-cyan-950 px-4 py-2 text-sm font-medium text-cyan-200 transition-colors hover:bg-cyan-900 disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Share your duck"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
