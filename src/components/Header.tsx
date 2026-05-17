"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import CartDrawer from "./CartDrawer";

const CART_COUNT = 0;

export default function Header() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b"
        style={{ background: "var(--color-bg)", borderColor: "var(--color-border)" }}
      >
        <Link href="/" className="flex items-center gap-2 group">
          <span className="logo-mark w-7 h-7 relative shrink-0 inline-block">
            <Image src="/logo.svg" alt="offhand" fill className="object-contain" priority />
          </span>
          <span
            className="text-sm font-bold leading-none transition-colors"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text)")}
          >
            offhand
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          <Link
            href="/"
            className="text-xs transition-colors"
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text)")}
          >
            things
          </Link>
          <Link
            href="/reading"
            className="text-xs transition-colors"
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text)")}
          >
            reading
          </Link>
          {CART_COUNT > 0 && (
            <button
              onClick={() => setCartOpen(true)}
              className="text-xs transition-colors"
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text)")}
            >
              ({CART_COUNT})
            </button>
          )}
        </nav>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
