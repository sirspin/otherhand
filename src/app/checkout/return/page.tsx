"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ReturnContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<"loading" | "complete" | "open" | "error">("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) { setStatus("error"); return; }

    fetch(`/api/checkout/status?session_id=${sessionId}`)
      .then(r => r.json())
      .then(data => {
        setStatus(data.status ?? "error");
        setEmail(data.customerEmail ?? null);
      })
      .catch(() => setStatus("error"));
  }, [sessionId]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-6 px-8 text-center"
      style={{ background: "var(--color-bg)" }}
    >
      {status === "loading" && (
        <p className="text-xs" style={{ opacity: 0.3 }}>confirming…</p>
      )}

      {status === "complete" && (
        <>
          <p className="text-sm">order confirmed.</p>
          {email && (
            <p className="text-xs" style={{ opacity: 0.4 }}>
              receipt sent to {email}
            </p>
          )}
          <p className="text-xs leading-relaxed max-w-xs" style={{ opacity: 0.35 }}>
            we&apos;ll be in touch when it ships. thanks for being interested.
          </p>
          <Link href="/" className="text-xs mt-4" style={{ color: "var(--color-accent)" }}>
            back to things →
          </Link>
        </>
      )}

      {(status === "open" || status === "error") && (
        <>
          <p className="text-xs" style={{ opacity: 0.5 }}>something went wrong.</p>
          <Link href="/" className="text-xs" style={{ color: "var(--color-accent)" }}>
            back to things →
          </Link>
        </>
      )}
    </div>
  );
}

export default function ReturnPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center">
        <p className="text-xs" style={{ opacity: 0.3 }}>confirming…</p>
      </div>
    }>
      <ReturnContent />
    </Suspense>
  );
}
