import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <Hero />
      <main className="flex-1 px-4 pt-6 pb-16">
        <ProductGrid />
      </main>
      <Footer />
    </>
  );
}
