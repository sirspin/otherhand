"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const { slug, title, price, currency = "USD", sold = false, sizes = [] } = product;
  const [hovered, setHovered] = useState(false);

  const bg = hovered && !sold ? "var(--color-accent)" : "var(--color-bg)";
  const imgBg = hovered && !sold ? "rgba(0,0,0,0.12)" : "var(--color-grey)";
  const textColor = hovered && !sold ? "#fff" : "var(--color-text)";

  return (
    <Link
      href={`/shop/${slug}`}
      className="block"
      aria-label={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="p-3 border"
        style={{
          background: bg,
          borderColor: hovered && !sold ? "var(--color-accent)" : "var(--color-border)",
          transition: "background 0.3s var(--ease), border-color 0.3s var(--ease)",
        }}
      >
        {/* Image container */}
        <div
          className="relative aspect-square overflow-hidden mb-3"
          style={{
            background: imgBg,
            transition: "background 0.3s var(--ease)",
          }}
        >
          {sold && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span
                className="text-[10px] tracking-widest uppercase px-2 py-1 border"
                style={{
                  borderColor: textColor,
                  background: "transparent",
                  color: textColor,
                }}
              >
                Sold Out
              </span>
            </div>
          )}
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={title}
              className="w-full h-full object-cover"
              style={{ opacity: sold ? 0.4 : 1 }}
            />
          ) : (
            <div className="w-full h-full" />
          )}
        </div>

        {/* Title + price */}
        <div className="flex items-baseline justify-between gap-2">
          <p
            className="text-xs tracking-wide uppercase leading-tight flex-1"
            style={{ color: textColor, transition: "color 0.3s var(--ease)" }}
          >
            {title}
          </p>
          <p
            className="text-xs tracking-wide leading-none tabular-nums shrink-0"
            style={{ color: textColor, transition: "color 0.3s var(--ease)" }}
          >
            {sold ? "—" : `${currency === "USD" ? "$" : currency}${price.toFixed(2)}`}
          </p>
        </div>

        {/* Sizes — fade in on hover */}
        {sizes.length > 0 && (
          <p
            className="text-[10px] tracking-widest uppercase mt-1.5 transition-opacity duration-200"
            style={{
              color: hovered ? "rgba(255,255,255,0.7)" : "transparent",
              opacity: hovered ? 1 : 0,
            }}
          >
            {sizes.join(" / ")}
          </p>
        )}
      </div>
    </Link>
  );
}
