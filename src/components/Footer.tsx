import EmailForm from "./EmailForm";

const FOOTER_LINKS = [
  { label: "About", href: "/about" },
  { label: "Shipping & Returns", href: "/shipping" },
  { label: "Instagram", href: "https://instagram.com", external: true },
  { label: "Contact", href: "mailto:hello@offhand.com", external: false },
];

export default function Footer() {
  return (
    <footer style={{ background: "var(--color-olive)", color: "#fff" }}>
      {/* Mailing list band */}
      <div className="px-4 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] tracking-widest uppercase">Mailing List</p>
          <div className="sm:w-80">
            <EmailForm dark />
          </div>
        </div>
      </div>

      {/* Big wordmark */}
      <div className="px-4 py-10 flex items-end justify-between overflow-hidden">
        <p
          className="leading-none font-bold tracking-tighter select-none"
          style={{ fontSize: "clamp(3rem, 14vw, 10rem)", color: "#fff" }}
        >
          OFFHAND
        </p>
        <p className="text-[10px] tracking-wider self-end pb-2 opacity-40">
          © {new Date().getFullYear()}
        </p>
      </div>

      {/* Bottom nav bar */}
      <div
        className="border-t px-4 py-3 flex flex-wrap gap-x-6 gap-y-2 items-center"
        style={{ borderColor: "rgba(255,255,255,0.15)" }}
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
      </div>
    </footer>
  );
}
