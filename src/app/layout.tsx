import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Russo_One } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const russoOne = Russo_One({
  variable: "--font-russo-one",
  weight: "400",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080808",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://rank.energy"),
  title: {
    template: "%s | rank.energy",
    default: "rank.energy",
  },
  description:
    "Rank your favorite Monster Energy drinks. Create and share your personal tier list with the community.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://rank.energy",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "rank.energy",
    title: "rank.energy — Monster Energy Tier List",
    description:
      "Rank your favorite Monster Energy drinks. Create and share your personal tier list.",
    url: "https://rank.energy",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "rank.energy — Monster Energy Tier List",
    description:
      "Rank your favorite Monster Energy drinks. Create and share your personal tier list.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${russoOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col noise-bg scanlines">
        {children}
      </body>
    </html>
  );
}
