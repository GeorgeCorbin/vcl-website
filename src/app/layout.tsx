import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Favicon from "next/image";
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
  title: "Varsity Club Lacrosse",
  description: "Strictly Club. Strictly Business. Your source for MCLA, SMLL, NCLL, WCLL lacrosse news, rankings, transfers, and analysis.",
  icons: {
    icon: "/vcl_logo3.png",
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
        <Favicon src="/vcl_logo3.png" alt="Varsity Club Lacrosse" width={16} height={16} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
