import type { Metadata } from "next";
import { AIKBPreloader } from "@/components/ui/aikb-preloader";
import { AuthListener } from "@/components/auth-listener";
import "./globals.css";

// Using system fonts to avoid remote Google Fonts fetch during build

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
    <html lang="en" data-scroll-behavior="smooth" className={`h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AIKBPreloader />
        <AuthListener />
        {children}
      </body>
    </html>
  );
}
