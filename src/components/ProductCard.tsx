import Link from "next/link";

export type Product = {
  slug: string;
  title: string;
  price: number;
  currency?: string;
  sold?: boolean;
  image?: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const { slug, title, price, currency = "USD", sold = false } = product;

  return (
    <Link
      href={`/shop/${slug}`}
      className="group block"
      aria-label={title}
    >
      <div className="relative aspect-square bg-[#f0f0f0] overflow-hidden mb-2">
        {sold && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-[10px] tracking-widest uppercase border border-black bg-white px-2 py-1">
              Sold Out
            </span>
          </div>
        )}
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={title}
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex items-end p-3">
            <span className="text-[10px] tracking-wider uppercase text-black/30">
              {title}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between">
        <p className="text-xs tracking-wide uppercase leading-none">{title}</p>
        <p className="text-xs tracking-wide leading-none tabular-nums">
          {sold ? (
            <span className="text-black/40">—</span>
          ) : (
            <>
              {currency === "USD" ? "$" : currency}
              {price.toFixed(2)}
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
