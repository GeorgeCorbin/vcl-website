import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Anton } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { FEATURES } from "@/lib/feature-flags";
import { BottomAdBanner } from "@/components/ads";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Varsity Club Lacrosse",
  description: "Strictly Club. Strictly Business. Your source for MCLA, SMLL, NCLL, WCLL lacrosse news, rankings, and analysis.",
  icons: {
    icon: [{ url: "/vcl_logo3.png", type: "image/png" }],
    apple: [{ url: "/vcl_logo3.png", type: "image/png" }],
    shortcut: "/vcl_logo3.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} antialiased`}>
        {children}
        <Toaster />
        {FEATURES.ADS_PUBLIC && <BottomAdBanner />}
      </body>
    </html>
  );
}
