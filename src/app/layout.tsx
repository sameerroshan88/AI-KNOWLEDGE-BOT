import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AIKBPreloader } from "@/components/ui/aikb-preloader";
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
  title: "AI Knowledge Base Bot — Chat with any PDF",
  description:
    "AI Knowledge Base Bot lets you instantly interact with any PDF document by asking questions in plain English — powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AIKBPreloader />
        {children}
      </body>
    </html>
  );
}
