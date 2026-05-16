import Image from "next/image";

export default function Hero() {
  return (
    <section
      className="flex items-end justify-between px-4 pt-10 pb-8 border-b overflow-hidden"
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Editorial text block — Index Space style */}
      <div className="flex flex-col gap-2 max-w-lg">
        <h1
          className="leading-[0.9] tracking-tighter uppercase"
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontWeight: 800,
            fontSize: "clamp(3rem, 9vw, 7rem)",
            color: "var(--color-text)",
          }}
        >
          OFF
          <br />
          HAND
        </h1>
        <p
          className="text-xs tracking-widest uppercase mt-2"
          style={{ color: "var(--color-text)", opacity: 0.45 }}
        >
          Branded goods — limited runs
        </p>
      </div>

      {/* Logo mark — large, right-aligned */}
      <div
        className="logo-mark shrink-0 relative"
        style={{ width: "clamp(6rem, 16vw, 12rem)", aspectRatio: "1068/1432" }}
      >
        <Image
          src="/logo.svg"
          alt=""
          fill
          className="object-contain"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
