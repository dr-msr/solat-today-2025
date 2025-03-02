import type { Metadata } from "next";
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
  title: "Solat.Today by drmsr",
  description: "Get the prayer times for your location - Grounded with JAKIM Malaysia Database",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Solat.Today by drmsr",
    description: "Get the prayer times for your location - Grounded with JAKIM Malaysia Database",
    url: "https://solat.today/",
    siteName: "Solat.Today by drmsr",
    images: [
      {
        url: "https://solat.today/og.png",
        width: 1200,
        height: 630,
        alt: "Solat.Today by drmsr",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solat.Today by drmsr",
    description: "Get the prayer times for your location - Grounded with JAKIM Malaysia Database",
    creator: "@drmsr",
    site: "@drmsr",
    images: [
      {
        url: "https://solat.today/og.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
