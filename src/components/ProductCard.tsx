import Link from "next/link";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const { slug, title, price, currency = "USD", sold = false, sizes = [] } = product;

  return (
    <Link href={`/shop/${slug}`} className="group block" aria-label={title}>
      {/* Image */}
      <div
        className="relative aspect-square overflow-hidden mb-2"
        style={{ background: "var(--color-grey)" }}
      >
        {sold && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span
              className="text-[10px] tracking-widest uppercase px-2 py-1 border"
              style={{
                borderColor: "var(--color-text)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
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
            className="w-full h-full object-cover transition-opacity"
            style={{ opacity: sold ? 0.5 : 1 }}
          />
        ) : (
          <div className="w-full h-full flex items-end p-3">
            <span
              className="text-[10px] tracking-wider uppercase"
              style={{ color: "var(--color-text)", opacity: 0.25 }}
            >
              {title}
            </span>
          </div>
        )}
      </div>

      {/* Meta row */}
      <div className="flex items-baseline justify-between">
        <p className="text-xs tracking-wide uppercase leading-none">{title}</p>
        <p className="text-xs tracking-wide leading-none tabular-nums">
          {sold ? (
            <span style={{ color: "var(--color-text)", opacity: 0.35 }}>—</span>
          ) : (
            <span>
              {currency === "USD" ? "$" : currency}
              {price.toFixed(2)}
            </span>
          )}
        </p>
      </div>

      {/* Sizes — hidden, revealed on hover (CSS-only like Actual Source) */}
      {sizes.length > 0 && (
        <p
          className="text-[10px] tracking-widest uppercase mt-1 transition-opacity duration-200 opacity-0 group-hover:opacity-100"
          style={{ color: "var(--color-accent)" }}
        >
          {sizes.join(" / ")}
        </p>
      )}
    </Link>
  );
}
