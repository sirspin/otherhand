import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ProductList from "@/components/ProductList";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <main className="flex-1 px-4 pt-2 pb-16">
        <ProductList />
      </main>
      <Footer />
    </>
  );
}
