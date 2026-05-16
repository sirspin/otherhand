"use client";

import { useState } from "react";

const MESSAGES = [
  "Free shipping on orders over $100",
  "OFFHAND branded goods",
  "New drops coming soon",
  "Limited runs — no restocks",
];

const TRACK = [...MESSAGES, ...MESSAGES].join("   —   ");

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className="relative overflow-hidden py-2"
      style={{ background: "var(--color-olive)", color: "#fff" }}
    >
      <div className="marquee-track">
        {[TRACK, TRACK].map((t, i) => (
          <span
            key={i}
            className="text-[11px] tracking-widest uppercase whitespace-nowrap px-8"
          >
            {t}
          </span>
        ))}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors text-base leading-none z-10"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
