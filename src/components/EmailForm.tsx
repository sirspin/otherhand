"use client";

import { useState } from "react";

export default function EmailForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-xs tracking-widest uppercase text-black/60 py-2">
        You&apos;re on the list.
      </p>
    );
  }

  return (
    <form className="flex gap-0 border border-black" onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 px-3 py-2 text-xs tracking-wide bg-white outline-none placeholder:text-black/30 min-w-0"
        aria-label="Email address"
        required
      />
      <button
        type="submit"
        className="px-4 py-2 text-xs tracking-widest uppercase bg-black text-white hover:bg-black/80 transition-colors whitespace-nowrap"
      >
        Subscribe
      </button>
    </form>
  );
}
