import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-black px-4 py-3 flex items-center justify-between">
      <Link
        href="/"
        className="text-sm tracking-widest uppercase font-bold hover:opacity-60 transition-opacity"
      >
        OFFHAND
      </Link>
      <nav className="flex items-center gap-6">
        <Link
          href="/shop"
          className="text-xs tracking-widest uppercase hover:opacity-60 transition-opacity"
        >
          Shop
        </Link>
        <Link
          href="/about"
          className="text-xs tracking-widest uppercase hover:opacity-60 transition-opacity"
        >
          About
        </Link>
        <Link
          href="/cart"
          className="text-xs tracking-widest uppercase hover:opacity-60 transition-opacity"
        >
          Cart (0)
        </Link>
      </nav>
    </header>
  );
}
