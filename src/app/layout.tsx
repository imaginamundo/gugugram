import { Silkscreen } from "next/font/google";
import "./globals.css";
import Header from "@components/Header";
import Footer from "@components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gugugram",
  description: "Your 15x15 image repository",
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
    <html lang="en" className={silkcreen.className}>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
