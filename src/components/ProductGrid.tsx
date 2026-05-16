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
      {/* Category nav — comma-list style like Actual Source */}
      <nav className="mb-8 border-b pb-4 flex flex-wrap items-baseline gap-x-0" style={{ borderColor: "var(--color-border)" }}>
        {categories.map((cat, i) => (
          <span key={cat} className="inline">
            <button
              onClick={() => setActiveCategory(cat)}
              className="text-xs tracking-widest uppercase transition-colors"
              style={{
                color: activeCategory === cat ? "var(--color-accent)" : "var(--color-text)",
                fontWeight: activeCategory === cat ? "600" : "400",
              }}
              onMouseEnter={e => { if (activeCategory !== cat) e.currentTarget.style.color = "var(--color-accent)"; }}
              onMouseLeave={e => { if (activeCategory !== cat) e.currentTarget.style.color = "var(--color-text)"; }}
            >
              {cat}
            </button>
            {i < categories.length - 1 && (
              <span className="text-xs mr-1" style={{ color: "var(--color-text)", opacity: 0.3 }}>,</span>
            )}
          </span>
        ))}
        <span className="ml-auto text-[11px] tracking-wide" style={{ color: "var(--color-text)", opacity: 0.35 }}>
          {available} available
        </span>
      </nav>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </>
  );
}
