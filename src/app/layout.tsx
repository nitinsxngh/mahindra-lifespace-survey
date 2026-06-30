import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mahindra Happinest Palghar | Amenity Survey",
  description:
    "Share your amenity preferences for Mahindra Happinest Palghar through our quick survey",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E31837",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans`}
      >
        <div className="relative min-h-screen overflow-hidden bg-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-50/90 via-white to-white"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-brand-100/40 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-charcoal-100/50 blur-3xl"
          />
          <main className="relative z-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
