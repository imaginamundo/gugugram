import "./globals.css";

import type { Metadata } from "next";
import { Silkscreen } from "next/font/google";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Gugugram",
  description: "Guarde suas fotos num lugar",
};

const silkcreen = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={silkcreen.className}>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
