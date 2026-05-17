"use client";

import { useState } from "react";
import ProductEntry from "./ProductEntry";
import { products, tags } from "@/lib/products";

export default function ProductList() {
  const [activeTag, setActiveTag] = useState("all");

  const filtered =
    activeTag === "all"
      ? products
      : products.filter((p) => p.tags?.includes(activeTag));

  // Only show tags that have at least one product
  const activeTags = tags.filter(
    (t) => t === "all" || products.some((p) => p.tags?.includes(t))
  );

  return (
    <>
      {/* Tag filter — plain text, no borders */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-4 border-b" style={{ borderColor: "rgba(26,25,24,0.12)" }}>
        {activeTags.map((tag, i) => (
          <span key={tag} className="inline-flex items-center gap-3">
            <button
              onClick={() => setActiveTag(tag)}
              className="text-xs transition-colors"
              style={{
                color: activeTag === tag ? "var(--color-text)" : "var(--color-text)",
                opacity: activeTag === tag ? 1 : 0.35,
                fontWeight: activeTag === tag ? 600 : 400,
                textDecoration: activeTag === tag ? "underline" : "none",
                textUnderlineOffset: "3px",
              }}
              onMouseEnter={e => { if (activeTag !== tag) (e.currentTarget as HTMLButtonElement).style.opacity = "0.7"; }}
              onMouseLeave={e => { if (activeTag !== tag) (e.currentTarget as HTMLButtonElement).style.opacity = "0.35"; }}
            >
              {tag}
            </button>
            {i < activeTags.length - 1 && (
              <span style={{ opacity: 0.2, fontSize: "0.6rem" }}>·</span>
            )}
          </span>
        ))}
      </div>

      {/* Entries */}
      <div>
        {filtered.map((product) => (
          <ProductEntry key={product.slug} product={product} />
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-xs" style={{ opacity: 0.35 }}>
            nothing here yet.
          </p>
        )}
      </div>
    </>
  );
}
