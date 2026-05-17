"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/products";

export default function ProductEntry({ product }: { product: Product }) {
  const { slug, title, price, description, sizes = [], sold = false } = product;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="border-b py-5 flex gap-5"
      style={{ borderColor: "rgba(26,25,24,0.12)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <Link
        href={`/things/${slug}`}
        className="shrink-0 block"
        style={{ width: 80, height: 80 }}
        tabIndex={-1}
        aria-hidden="true"
      >
        <div
          className="w-full h-full transition-colors duration-200"
          style={{ background: hovered ? "var(--color-grey)" : "var(--color-grey)", opacity: sold ? 0.4 : 1 }}
        >
          {product.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={title} className="w-full h-full object-cover" />
          )}
        </div>
      </Link>

      {/* Entry text */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <Link
              href={`/things/${slug}`}
              className="text-sm leading-none transition-colors"
              style={{ color: hovered ? "var(--color-accent)" : "var(--color-text)" }}
            >
              {title}
            </Link>
            <span
              className="text-xs tabular-nums shrink-0 transition-opacity"
              style={{ opacity: sold ? 0.3 : 0.7 }}
            >
              {sold ? "gone" : `$${price}`}
            </span>
          </div>

          {description && (
            <p className="text-xs mt-1 leading-relaxed" style={{ opacity: 0.45 }}>
              {description}
            </p>
          )}
        </div>

        {!sold && sizes.length > 0 && (
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs" style={{ opacity: 0.4 }}>
              {sizes.join("  ")}
            </span>
            <Link
              href={`/things/${slug}`}
              className="text-xs transition-colors"
              style={{ color: hovered ? "var(--color-accent)" : "var(--color-text)" }}
            >
              →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
