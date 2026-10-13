import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://solat.today"),
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
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solat.Today by drmsr",
    description: "Get the prayer times for your location - Grounded with JAKIM Malaysia Database",
    creator: "@drmsr",
    site: "@drmsr",
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
        <Toaster />
      </body>
    </html>
  );
}
