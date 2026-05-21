import type { Metadata } from "next";
import { Sono } from "next/font/google";
import "./globals.css";

const sono = Sono({
  variable: "--font-sono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OTHERHAND",
  description: "OTHERHAND — things worth being interested in.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={sono.variable}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
