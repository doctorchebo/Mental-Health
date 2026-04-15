import { Geist } from "next/font/google";
import "./globals.css";

export const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
