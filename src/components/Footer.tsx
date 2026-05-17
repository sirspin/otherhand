import Image from "next/image";
import EmailForm from "./EmailForm";

export default function Footer() {
  return (
    <footer
      className="mt-auto px-4 pt-10 pb-6 border-t"
      style={{ borderColor: "rgba(26,25,24,0.12)" }}
    >
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between sm:gap-16">
        {/* About paragraph — no heading */}
        <p className="text-xs leading-relaxed max-w-xs" style={{ opacity: 0.45 }}>
          offhand is about restoring the individual&apos;s ability to be casually
          interested in things. art, science, records, whatever deserves
          a second look. we make objects that come from that.
        </p>

        <div className="flex flex-col gap-5 shrink-0">
          {/* Mailing list */}
          <div>
            <p className="text-xs mb-2" style={{ opacity: 0.45 }}>stay in the loop</p>
            <EmailForm />
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a
              href="https://instagram.com"
              className="text-xs ext-link transition-opacity hover:opacity-60"
              target="_blank"
              rel="noopener noreferrer"
            >
              instagram
            </a>
            <a
              href="mailto:hello@offhand.com"
              className="text-xs transition-opacity hover:opacity-60"
            >
              say hello
            </a>
            <a href="/shipping" className="text-xs transition-opacity hover:opacity-60">
              shipping
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between mt-10 pt-4 border-t" style={{ borderColor: "rgba(26,25,24,0.08)" }}>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 relative inline-block" style={{ opacity: 0.3 }}>
            <Image src="/logo.svg" alt="" fill className="object-contain" aria-hidden="true" />
          </span>
          <span className="text-[10px]" style={{ opacity: 0.3 }}>offhand © {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
