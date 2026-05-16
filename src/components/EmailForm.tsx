"use client";

import { useState } from "react";

export default function EmailForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const borderColor = dark ? "rgba(255,255,255,0.4)" : "var(--color-border)";
  const bgColor = dark ? "transparent" : "var(--color-bg)";
  const textColor = dark ? "#fff" : "var(--color-text)";
  const placeholderOpacity = dark ? "placeholder:text-white/40" : "placeholder:text-black/30";

  if (submitted) {
    return (
      <p
        className="text-[11px] tracking-widest uppercase py-2"
        style={{ color: textColor, opacity: 0.6 }}
      >
        You&apos;re on the list.
      </p>
    );
  }

  return (
    <form
      className="flex border"
      style={{ borderColor }}
      onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true); }}
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className={`flex-1 px-3 py-2 text-xs tracking-wide outline-none min-w-0 bg-transparent ${placeholderOpacity}`}
        style={{ color: textColor }}
        aria-label="Email address"
        required
      />
      <button
        type="submit"
        className="px-4 py-2 text-[11px] tracking-widest uppercase transition-opacity hover:opacity-70 whitespace-nowrap"
        style={{
          background: dark ? "rgba(255,255,255,0.15)" : "var(--color-text)",
          color: dark ? "#fff" : "#fff",
          borderLeft: `1px solid ${borderColor}`,
        }}
      >
        Subscribe
      </button>
    </form>
  );
}
