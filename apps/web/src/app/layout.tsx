import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LunaJoy — Wellness Tracker",
  description: "Track your daily mood, sleep, and mental health.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={geistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
