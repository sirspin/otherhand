"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import { products, categories } from "@/lib/products";

export default function ProductGrid() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const available = filtered.filter((p) => !p.sold).length;

  return (
    <>
      {/* Category bar — Braindead-style pill containers */}
      <div
        className="flex items-center gap-2 py-5 border-b mb-8 overflow-x-auto"
        style={{ borderColor: "var(--color-border)" }}
      >
        {categories.map((cat) => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="shrink-0 px-4 py-1.5 text-[11px] tracking-widest uppercase border transition-all"
              style={{
                background: active ? "var(--color-text)" : "transparent",
                color: active ? "#fff" : "var(--color-text)",
                borderColor: "var(--color-border)",
                transition: "background 0.25s var(--ease), color 0.25s var(--ease)",
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--color-accent)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-accent)";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
                }
              }}
            >
              {cat}
            </button>
          );
        })}
        <span
          className="ml-auto shrink-0 text-[11px] tracking-wide"
          style={{ color: "var(--color-text)", opacity: 0.35 }}
        >
          {available} available
        </span>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </>
  );
}
