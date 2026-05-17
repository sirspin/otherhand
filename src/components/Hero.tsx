import Image from "next/image";

export default function Hero() {
  return (
    <section
      className="flex items-center justify-between px-4 py-8 border-b"
      style={{ borderColor: "var(--color-border)" }}
    >
      <p className="text-xs max-w-xs leading-relaxed" style={{ opacity: 0.5 }}>
        restoring the individual&apos;s ability to be interested in things —
        across art, science, whatever deserves attention.
      </p>

      <div
        className="logo-mark shrink-0 relative"
        style={{ width: "clamp(4rem, 10vw, 7rem)", aspectRatio: "1068/1432" }}
      >
        <Image src="/logo.svg" alt="" fill className="object-contain" aria-hidden="true" />
      </div>
    </section>
  );
}
