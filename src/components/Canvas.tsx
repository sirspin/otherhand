"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useMousePosition } from "@/hooks/useMousePosition";
import { products } from "@/lib/products";
import EmailForm from "./EmailForm";

// ── helpers ────────────────────────────────────────────────────────────────

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function edgeProx(
  mx: number, my: number,
  corner: "tr" | "br" | "bl",
  vw: number, vh: number,
  radius: number
) {
  if (mx < 0) return 0;
  const cx = corner === "bl" ? 0 : vw;
  const cy = corner === "tr" ? 0 : vh;
  return Math.max(0, 1 - dist(mx, my, cx, cy) / radius);
}

// ── ProductLine ─────────────────────────────────────────────────────────────

type ProductLineProps = {
  product: (typeof products)[0];
  mouse: { x: number; y: number };
  onHover: (slug: string | null) => void;
};

function ProductLine({ product, mouse, onHover }: ProductLineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const update = () => {
      if (ref.current) setRect(ref.current.getBoundingClientRect());
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const d = rect
    ? dist(mouse.x, mouse.y, rect.left + rect.width / 2, rect.top + rect.height / 2)
    : 999;
  const prox = mouse.x < 0 ? 0 : Math.max(0, 1 - d / 280);
  const opacity = hovered ? 1 : 0.05 + prox * 0.3;

  const enter = () => { setHovered(true); onHover(product.slug); };
  const leave = () => { setHovered(false); onHover(null); };

  return (
    <div
      ref={ref}
      onMouseEnter={enter}
      onMouseLeave={leave}
      className="py-3 cursor-default select-none"
      style={{ opacity, transition: "opacity 0.4s cubic-bezier(0.15,0.85,0.45,1)" }}
    >
      {/* Title row */}
      <div className="flex items-baseline justify-between gap-8">
        <span
          className="text-sm"
          style={{
            color: hovered ? "var(--color-accent)" : "var(--color-text)",
            transition: "color 0.25s cubic-bezier(0.15,0.85,0.45,1)",
          }}
        >
          {product.title}
        </span>
        <span
          className="text-xs tabular-nums"
          style={{
            opacity: hovered ? 0.6 : 0,
            transform: hovered ? "translateX(0)" : "translateX(8px)",
            transition: "opacity 0.3s, transform 0.3s cubic-bezier(0.15,0.85,0.45,1)",
          }}
        >
          {product.sold ? "gone" : `$${product.price}`}
        </span>
      </div>

      {/* Expandable detail */}
      <div
        style={{
          maxHeight: hovered ? "80px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.15,0.85,0.45,1)",
        }}
      >
        {product.description && (
          <p className="text-xs pt-1.5 leading-relaxed" style={{ opacity: 0.4 }}>
            {product.description}
          </p>
        )}
        {!product.sold && product.sizes && (
          <p className="text-xs pt-1" style={{ opacity: 0.25 }}>
            {product.sizes.join("  ")}
          </p>
        )}
      </div>
    </div>
  );
}

// ── AboutOverlay ─────────────────────────────────────────────────────────────

function AboutOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const linkStyle = {
    color: "#fff" as const,
    transition: "opacity 0.2s",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-center px-10 sm:px-16"
      style={{
        background: "var(--color-olive)",
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.5s cubic-bezier(0.15,0.85,0.45,1)",
        pointerEvents: open ? "auto" : "none",
      }}
      onClick={onClose}
    >
      <p
        className="text-xs leading-relaxed max-w-xs mb-10"
        style={{ color: "#fff", opacity: 0.6 }}
      >
        otherhand is about restoring the individual&apos;s ability to be casually
        interested in things — art, science, records, whatever deserves a second look.
        we make objects that come from that.
      </p>

      <nav className="flex flex-col gap-4" onClick={e => e.stopPropagation()}>
        {[
          { label: "things →", href: "/" },
          { label: "reading →", href: "/reading" },
        ].map(({ label, href }) => (
          <a
            key={href}
            href={href}
            className="text-sm"
            style={linkStyle}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.5")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            onClick={onClose}
          >
            {label}
          </a>
        ))}
        <a
          href="https://instagram.com"
          className="text-sm"
          style={linkStyle}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.5")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          instagram ↗
        </a>
        <a
          href="mailto:hello@otherhand.com"
          className="text-sm"
          style={linkStyle}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.5")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          say hello
        </a>
      </nav>

      <div className="mt-12 max-w-xs" onClick={e => e.stopPropagation()}>
        <EmailForm dark />
      </div>

      <p
        className="absolute bottom-6 right-8 text-[10px]"
        style={{ color: "#fff", opacity: 0.25 }}
      >
        esc or click to close
      </p>
    </div>
  );
}

// ── Canvas ───────────────────────────────────────────────────────────────────

export default function Canvas() {
  const mouse = useMousePosition();
  const [vw, setVw] = useState(1440);
  const [vh, setVh] = useState(900);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => {
    const update = () => { setVw(window.innerWidth); setVh(window.innerHeight); };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleHover = useCallback((slug: string | null) => {
    setHoveredSlug(slug);
  }, []);

  const readingP = edgeProx(mouse.x, mouse.y, "tr", vw, vh, 180);
  const thingsP  = edgeProx(mouse.x, mouse.y, "br", vw, vh, 160);
  const aboutP   = edgeProx(mouse.x, mouse.y, "bl", vw, vh, 220);

  return (
    <>
      <div
        className="fixed inset-0"
        style={{ background: "var(--color-bg)", overflow: "hidden" }}
      >
        {/* ── Mark — always visible, top-left ── */}
        <button
          className="logo-mark fixed z-40"
          style={{ top: 22, left: 22, width: 30, height: 40, background: "none", border: "none", padding: 0, cursor: "pointer" }}
          onClick={() => setOverlayOpen(o => !o)}
          aria-label="about"
        >
          <Image src="/logo.svg" alt="" fill className="object-contain" priority />
        </button>

        {/* ── "reading" — top-right, cursor-revealed ── */}
        <a
          href="/reading"
          className="fixed z-30 text-xs"
          style={{
            top: 26,
            right: 24,
            opacity: readingP,
            transform: `translateX(${(1 - readingP) * 10}px)`,
            transition: "opacity 0.4s, transform 0.4s cubic-bezier(0.15,0.85,0.45,1)",
            pointerEvents: readingP > 0.05 ? "auto" : "none",
            color: "var(--color-text)",
          }}
        >
          reading
        </a>

        {/* ── "things" — bottom-right, cursor-revealed, dimmer (you're already here) ── */}
        <span
          className="fixed z-30 text-xs"
          style={{
            bottom: 24,
            right: 24,
            opacity: thingsP * 0.25,
            transition: "opacity 0.4s",
            pointerEvents: "none",
            color: "var(--color-text)",
          }}
        >
          things
        </span>

        {/* ── About note — bottom-left, cursor-revealed ── */}
        <p
          className="fixed z-30 text-xs leading-relaxed"
          style={{
            bottom: 24,
            left: 68,
            maxWidth: 260,
            opacity: aboutP * 0.4,
            transform: `translateY(${(1 - aboutP) * 6}px)`,
            transition: "opacity 0.5s, transform 0.5s cubic-bezier(0.15,0.85,0.45,1)",
            pointerEvents: "none",
            color: "var(--color-text)",
          }}
        >
          restoring the individual&apos;s ability to be casually interested in things —
          art, science, records, whatever deserves attention.
        </p>

        {/* ── Product field — centered ── */}
        <div
          className="fixed z-20"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(460px, 78vw)",
          }}
        >
          <div style={{ borderTop: "1px solid rgba(26,25,24,0.07)" }} />
          {products.map(p => (
            <ProductLine
              key={p.slug}
              product={p}
              mouse={mouse}
              onHover={handleHover}
            />
          ))}
          <div style={{ borderTop: "1px solid rgba(26,25,24,0.07)" }} />
        </div>

        {/* ── Cursor ghost — follows cursor when product hovered ── */}
        {hoveredSlug && mouse.x > 0 && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              left: mouse.x + 18,
              top: mouse.y - 28,
              width: 40,
              height: 54,
              opacity: 0.1,
              transition: "left 0.06s linear, top 0.06s linear",
            }}
          >
            <Image src="/logo.svg" alt="" fill className="object-contain" />
          </div>
        )}
      </div>

      {/* ── About overlay ── */}
      <AboutOverlay open={overlayOpen} onClose={() => setOverlayOpen(false)} />
    </>
  );
}
