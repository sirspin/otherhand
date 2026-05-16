"use client";

import Link from "next/link";
import { useState } from "react";
import CartDrawer from "./CartDrawer";

const NAV_LINKS = [
  { label: "Shop", href: "/" },
  { label: "About", href: "/about" },
];

export default function Header() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b"
        style={{
          background: "var(--color-bg)",
          borderColor: "var(--color-border)",
        }}
      >
        <Link
          href="/"
          className="text-sm tracking-widest uppercase font-bold transition-colors"
          style={{ color: "var(--color-text)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text)")}
        >
          OFFHAND
        </Link>

        <nav className="flex items-center gap-6">
          {NAV_LINKS.map(({ label, href }) => (
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
