import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 pt-8 pb-16">
        <div className="mb-8 border-b border-black pb-4 flex items-baseline justify-between">
          <h1 className="text-xs tracking-widest uppercase">Shop</h1>
          <p className="text-xs text-black/40 tracking-wide">
            {products.filter((p) => !p.sold).length} items available
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
