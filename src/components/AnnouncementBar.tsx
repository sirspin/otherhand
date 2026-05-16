"use client";

import { useState } from "react";

const MESSAGE = "Free shipping on orders over $100 — OFFHAND branded goods";

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className="relative flex items-center justify-center px-8 py-2 text-center"
      style={{ background: "var(--color-olive)", color: "#fff" }}
    >
      <p className="text-[11px] tracking-widest uppercase">
        {MESSAGE}
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors text-base leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
