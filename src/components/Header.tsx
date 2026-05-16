"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-2 border-b"
        style={{
          background: "var(--color-bg)",
          borderColor: "var(--color-border)",
        }}
      >
        {/* Wordmark + mark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="logo-mark w-8 h-8 relative shrink-0">
            <Image
              src="/logo.svg"
              alt="OFFHAND mark"
              fill
              className="object-contain"
              priority
            />
          </span>
          <span
            className="text-sm tracking-widest uppercase font-bold transition-colors"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text)")}
          >
            OFFHAND
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6">
          {[
            { label: "Shop", href: "/" },
            { label: "About", href: "/about" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-xs tracking-widest uppercase transition-colors"
              style={{ color: "var(--color-text)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text)")}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={() => setCartOpen(true)}
            className="text-xs tracking-widest uppercase transition-colors"
            style={{ color: "var(--color-text)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text)")}
          >
            Bag (0)
          </button>
        </nav>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
