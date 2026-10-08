import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ThemeInitializer from "@/components/ThemeInitializer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SignConnect \u2014 Communicate without barriers",
  description:
    "SignConnect turns your custom hand gestures into spoken words, so you can communicate in online meetings without knowing formal sign language.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col md:flex-row">
        <ThemeInitializer />
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </body>
    </html>
  );
}
