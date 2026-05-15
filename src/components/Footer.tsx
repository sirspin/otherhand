import EmailForm from "./EmailForm";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-black px-4 py-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase mb-3">Mailing List</p>
          <EmailForm />
        </div>
        <div className="flex flex-col gap-1 text-right">
          <a
            href="https://instagram.com"
            className="text-xs tracking-widest uppercase hover:opacity-60 transition-opacity"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            href="mailto:hello@offhand.com"
            className="text-xs tracking-widest uppercase hover:opacity-60 transition-opacity"
          >
            Contact
          </a>
        </div>
      </div>
      <p className="mt-8 text-[10px] tracking-wider text-black/40">
        © {new Date().getFullYear()} OFFHAND. All rights reserved.
      </p>
    </footer>
  );
}
