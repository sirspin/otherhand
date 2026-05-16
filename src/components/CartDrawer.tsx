"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: Props) {
  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: "rgba(26,25,24,0.4)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 z-50 h-full w-full max-w-sm flex flex-col border-l"
        style={{
          background: "var(--color-bg)",
          borderColor: "var(--color-border)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
        }}
        aria-label="Cart"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
          <span className="text-xs tracking-widest uppercase">Bag (0)</span>
          <button
            onClick={onClose}
            className="text-xs tracking-widest uppercase hover:opacity-50 transition-opacity"
            aria-label="Close cart"
          >
            Close
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs tracking-wide" style={{ color: "var(--color-text)", opacity: 0.4 }}>
            Your bag is empty.
          </p>
        </div>
        <div className="px-4 py-4 border-t" style={{ borderColor: "var(--color-border)" }}>
          <button
            className="w-full py-3 text-xs tracking-widest uppercase text-white transition-opacity hover:opacity-80"
            style={{ background: "var(--color-text)" }}
            disabled
          >
            Checkout
          </button>
        </div>
      </aside>
    </>
  );
}
