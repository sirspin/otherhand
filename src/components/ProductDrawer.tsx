"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { type Product } from "@/lib/products";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type DrawerState = "details" | "checkout";

export default function ProductDrawer({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const open = product !== null;
  const [view, setView] = useState<DrawerState>("details");

  // Reset to details view whenever a new product opens
  useEffect(() => {
    if (open) setView("details");
  }, [product?.slug, open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const fetchClientSecret = useCallback(async () => {
    if (!product?.stripePriceId) return "";
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId: product.stripePriceId }),
    });
    const { clientSecret } = await res.json();
    return clientSecret as string;
  }, [product?.stripePriceId]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          pointerEvents: open ? "auto" : "none",
          background: "rgba(26,25,24,0.18)",
          opacity: open ? 1 : 0,
          transition: "opacity 0.4s cubic-bezier(0.15,0.85,0.45,1)",
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col cursor-none"
        style={{
          width: "min(400px, 90vw)",
          background: "var(--color-bg)",
          borderLeft: "1px solid rgba(26,25,24,0.08)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.5s cubic-bezier(0.15,0.85,0.45,1)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* Header row */}
        <div
          className="flex items-center justify-between px-7 py-5 shrink-0"
          style={{ borderBottom: "1px solid rgba(26,25,24,0.06)" }}
        >
          {view === "checkout" ? (
            <button
              onClick={() => setView("details")}
              className="text-xs cursor-none"
              style={{ opacity: 0.4, background: "none", border: "none", padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.4")}
            >
              ← back
            </button>
          ) : (
            <span className="text-xs" style={{ opacity: 0.25 }}>
              {product?.title ?? ""}
            </span>
          )}

          <button
            onClick={onClose}
            className="text-xs cursor-none"
            style={{ opacity: 0.3, background: "none", border: "none", padding: 0 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.3")}
          >
            esc
          </button>
        </div>

        {/* Body */}
        {product && (
          <div className="flex flex-col flex-1 overflow-hidden">

            {/* ── Details view ── */}
            <div
              className="flex flex-col flex-1 overflow-y-auto"
              style={{
                opacity: view === "details" ? 1 : 0,
                pointerEvents: view === "details" ? "auto" : "none",
                transition: "opacity 0.25s",
                position: view === "checkout" ? "absolute" : "relative",
              }}
            >
              {/* Image */}
              <div
                className="w-full shrink-0 relative flex items-center justify-center"
                style={{ height: "40vh", background: "var(--color-grey)" }}
              >
                {product.image ? (
                  <Image src={product.image} alt={product.title} fill className="object-cover" />
                ) : (
                  <div style={{ width: 56, height: 74, position: "relative", opacity: 0.1 }}>
                    <Image src="/logo.svg" alt="" fill className="object-contain" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="px-7 py-6 flex flex-col gap-5">
                <div className="flex items-baseline justify-between gap-6">
                  <h2 className="text-sm">{product.title}</h2>
                  <span className="text-xs tabular-nums shrink-0" style={{ opacity: 0.4 }}>
                    {product.sold ? "gone" : `$${product.price}`}
                  </span>
                </div>

                <div style={{ borderTop: "1px solid rgba(26,25,24,0.07)" }} />

                {product.description && (
                  <p className="text-xs leading-relaxed" style={{ opacity: 0.5 }}>
                    {product.description}
                  </p>
                )}

                {!product.sold && product.sizes && (
                  <div>
                    <p className="text-[10px] mb-2.5 uppercase tracking-widest" style={{ opacity: 0.25 }}>
                      sizes
                    </p>
                    <div className="flex gap-2.5 flex-wrap">
                      {product.sizes.map(s => (
                        <span
                          key={s}
                          className="text-xs border px-3 py-1"
                          style={{ borderColor: "rgba(26,25,24,0.14)" }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.tags && (
                  <div className="flex gap-2.5 flex-wrap">
                    {product.tags.map(t => (
                      <span key={t} className="text-[10px]" style={{ opacity: 0.2 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <div className="mt-2">
                  {product.sold ? (
                    <p className="text-xs" style={{ opacity: 0.3 }}>this one is gone.</p>
                  ) : product.stripePriceId ? (
                    <button
                      onClick={() => setView("checkout")}
                      className="text-xs cursor-none w-full py-3 text-left"
                      style={{
                        background: "var(--color-text)",
                        color: "var(--color-bg)",
                        border: "none",
                        paddingLeft: "1.25rem",
                        paddingRight: "1.25rem",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                    >
                      order — ${product.price} →
                    </button>
                  ) : (
                    <a
                      href={`mailto:hello@otherhand.com?subject=interested in ${product.title}`}
                      className="text-xs"
                      style={{ color: "var(--color-accent)" }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = "0.6")}
                      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                    >
                      say hello to order →
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* ── Checkout view ── */}
            {view === "checkout" && product.stripePriceId && (
              <div className="flex-1 overflow-y-auto">
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{ fetchClientSecret }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
