import Image from "next/image";
import EmailForm from "./EmailForm";

const FOOTER_LINKS = [
  { label: "About", href: "/about", external: false },
  { label: "Shipping & Returns", href: "/shipping", external: false },
  { label: "Instagram", href: "https://instagram.com", external: true },
  { label: "Contact", href: "mailto:hello@offhand.com", external: false },
];

export default function Footer() {
  return (
    <footer style={{ background: "var(--color-olive)", color: "#fff" }}>
      {/* Mailing list */}
      <div
        className="px-4 py-5 border-b flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        <p className="text-[11px] tracking-widest uppercase shrink-0">Mailing List</p>
        <div className="sm:w-80">
          <EmailForm dark />
        </div>
      </div>

      {/* Big wordmark + logo mark */}
      <div className="px-4 pt-10 pb-6 flex items-end justify-between overflow-hidden">
        <h2
          className="leading-none tracking-tighter uppercase"
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontWeight: 800,
            fontSize: "clamp(3.5rem, 15vw, 11rem)",
            color: "#fff",
          }}
        >
          OFFHAND
        </h2>
        <div
          className="logo-mark shrink-0 relative self-end mb-2"
          style={{ width: "clamp(3rem, 8vw, 6rem)", aspectRatio: "1068/1432", opacity: 0.6 }}
        >
          <Image src="/logo.svg" alt="" fill className="object-contain invert" aria-hidden="true" />
        </div>
      </div>

      {/* Bottom nav bar */}
      <div
        className="border-t px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2"
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        {FOOTER_LINKS.map(({ label, href, external }) => (
          <a
            key={label}
            href={href}
            className={`text-[11px] tracking-widest uppercase transition-opacity hover:opacity-60${external ? " ext-link" : ""}`}
            style={{ color: "#fff" }}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {label}
          </a>
        ))}
        <span className="ml-auto text-[10px] tracking-wider opacity-30">
          © {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
