"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useMousePosition } from "@/hooks/useMousePosition";
import { products } from "@/lib/products";
import { type Product } from "@/lib/products";
import EmailForm from "./EmailForm";
import ProductDrawer from "./ProductDrawer";

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
  product: Product;
  mouse: { x: number; y: number };
  isMobile: boolean;
  onSelect: (slug: string) => void;
};

function ProductLine({ product, mouse, isMobile, onSelect }: ProductLineProps) {
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
  const prox    = mouse.x < 0 ? 0 : Math.max(0, 1 - d / 280);
  const ambient = mouse.x < 0 ? 0 : Math.max(0, 1 - d / 520) * 0.18;
  const opacity = hovered ? 1 : (isMobile ? 0.15 : 0.05) + prox * 0.45 + ambient;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(product.slug)}
      className="py-3 cursor-none select-none"
      style={{ opacity, transition: "opacity 0.4s cubic-bezier(0.15,0.85,0.45,1)" }}
    >
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

      {/* Preview expand on hover */}
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

  const linkStyle = { color: "#fff" as const, transition: "opacity 0.2s" };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-center px-10 sm:px-16 cursor-none"
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

      <div
        className="absolute bottom-0 left-0 right-0 px-10 sm:px-16 py-5 flex items-center justify-between border-t"
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
        onClick={e => e.stopPropagation()}
      >
        <span className="text-[10px]" style={{ color: "#fff", opacity: 0.25 }}>
          © {new Date().getFullYear()} otherhand. all rights reserved.
        </span>
        <span className="text-[10px]" style={{ color: "#fff", opacity: 0.2 }}>
          esc · space · click to close
        </span>
      </div>
    </div>
  );
}

// ── Canvas ───────────────────────────────────────────────────────────────────

export default function Canvas() {
  const mouse = useMousePosition();
  const { isMobile, gyroActive, enableGyro } = mouse;
  const [vw, setVw] = useState(1440);
  const [vh, setVh] = useState(900);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const selectedProduct = selectedSlug
    ? (products.find(p => p.slug === selectedSlug) ?? null)
    : null;

  useEffect(() => {
    const update = () => { setVw(window.innerWidth); setVh(window.innerHeight); };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === " " && e.target === document.body) {
        e.preventDefault();
        setOverlayOpen(o => !o);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const handleSelect = useCallback((slug: string) => {
    setSelectedSlug(s => s === slug ? null : slug);
  }, []);

  const readingP = edgeProx(mouse.x, mouse.y, "tr", vw, vh, 180);
  const thingsP  = edgeProx(mouse.x, mouse.y, "br", vw, vh, 160);
  const aboutP   = edgeProx(mouse.x, mouse.y, "bl", vw, vh, 220);

  const cursorW = 32, cursorH = 42, hotX = 16, hotY = 14;
  const speed = Math.sqrt(mouse.vx ** 2 + mouse.vy ** 2);
  const SNEAK = 80;
  const sneakX = !mouse.isOnScreen && speed > 0 ? (mouse.vx / speed) * SNEAK : 0;
  const sneakY = !mouse.isOnScreen && speed > 0 ? (mouse.vy / speed) * SNEAK : 0;

  const mobileEdgeBoost = isMobile && gyroActive ? 0.15 : 0;

  return (
    <>
      <div
        className="fixed inset-0 cursor-none"
        style={{ background: "var(--color-bg)", overflow: "hidden" }}
      >
        {/* ── Mark — top-left ── */}
        <button
          className="logo-mark fixed z-40 cursor-none"
          style={{ top: 22, left: 22, width: 30, height: 40, background: "none", border: "none", padding: 0 }}
          onClick={() => setOverlayOpen(o => !o)}
          aria-label="about"
        >
          <Image src="/logo.svg" alt="" fill className="object-contain" priority />
        </button>

        {/* ── "reading" — top-right ── */}
        <a
          href="/reading"
          className="fixed z-30 text-xs cursor-none"
          style={{
            top: 26, right: 24,
            opacity: Math.max(mobileEdgeBoost, readingP),
            transform: `translateX(${(1 - readingP) * 10}px)`,
            transition: "opacity 0.4s, transform 0.4s cubic-bezier(0.15,0.85,0.45,1)",
            pointerEvents: readingP > 0.05 || mobileEdgeBoost > 0 ? "auto" : "none",
            color: "var(--color-text)",
          }}
        >
          reading
        </a>

        {/* ── "things" — bottom-right ── */}
        <span
          className="fixed z-30 text-xs"
          style={{
            bottom: 24, right: 24,
            opacity: Math.max(mobileEdgeBoost, thingsP * 0.25),
            transition: "opacity 0.4s",
            pointerEvents: "none",
            color: "var(--color-text)",
          }}
        >
          things
        </span>

        {/* ── About note — bottom-left ── */}
        <p
          className="fixed z-30 text-xs leading-relaxed"
          style={{
            bottom: 24, left: 68,
            maxWidth: 260,
            opacity: Math.max(mobileEdgeBoost * 0.6, aboutP * 0.4),
            transform: `translateY(${(1 - aboutP) * 6}px)`,
            transition: "opacity 0.5s, transform 0.5s cubic-bezier(0.15,0.85,0.45,1)",
            pointerEvents: "none",
            color: "var(--color-text)",
          }}
        >
          restoring the individual&apos;s ability to be casually interested in things —
          art, science, records, whatever deserves attention.
        </p>

        {/* ── Product field ── */}
        <div
          className="fixed z-20"
          style={{
            top: "50%", left: "50%",
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
              isMobile={isMobile}
              onSelect={handleSelect}
            />
          ))}
          <div style={{ borderTop: "1px solid rgba(26,25,24,0.07)" }} />
        </div>

        {/* ── Mobile: tap-to-start prompt ── */}
        {isMobile && !gyroActive && (
          <button
            onClick={enableGyro}
            className="fixed inset-0 z-30 flex flex-col items-center justify-end pb-16 gap-3"
            style={{ background: "transparent", border: "none" }}
            aria-label="enable tilt to explore"
          >
            <div style={{ position: "relative", width: 28, height: 36, opacity: 0.5 }}>
              <Image src="/logo.svg" alt="" fill className="object-contain" />
            </div>
            <span
              className="text-[11px] uppercase"
              style={{ opacity: 0.3, letterSpacing: "0.14em" }}
            >
              tilt to explore
            </span>
          </button>
        )}
      </div>

      {/* ── Product drawer ── */}
      <ProductDrawer
        product={selectedProduct}
        onClose={() => setSelectedSlug(null)}
      />

      {/* ── About overlay ── */}
      <AboutOverlay open={overlayOpen} onClose={() => setOverlayOpen(false)} />

      {/* ── Custom cursor (desktop only) ── */}
      {!isMobile && mouse.x > 0 && (
        <div
          className="fixed pointer-events-none"
          style={{
            zIndex: 9999,
            left: mouse.x - hotX,
            top: mouse.y - hotY,
            width: cursorW,
            height: cursorH,
            transform: `translate(${sneakX}px, ${sneakY}px)`,
            filter: overlayOpen ? "invert(1) brightness(10)" : "none",
            transition: "transform 0.55s cubic-bezier(0.15,0.85,0.45,1), filter 0.4s cubic-bezier(0.15,0.85,0.45,1)",
          }}
        >
          <Image src="/logo.svg" alt="" fill className="object-contain" />
        </div>
      )}
    </>
  );
}
