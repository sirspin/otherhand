"use client";

import { useState } from "react";

export default function EmailForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const textColor = dark ? "#fff" : "var(--color-text)";
  const borderColor = dark ? "rgba(255,255,255,0.3)" : "rgba(26,25,24,0.25)";

  if (submitted) {
    return <p className="text-xs" style={{ color: textColor, opacity: 0.5 }}>you&apos;re in.</p>;
  }

  return (
    <form
      className="flex border-b"
      style={{ borderColor }}
      onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true); }}
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your email"
        className="flex-1 py-1.5 text-xs bg-transparent outline-none min-w-0 placeholder:opacity-30"
        style={{ color: textColor }}
        aria-label="email address"
        required
      />
      <button
        type="submit"
        className="pl-3 py-1.5 text-xs shrink-0 transition-opacity hover:opacity-50"
        style={{ color: textColor }}
      >
        →
      </button>
    </form>
  );
}
