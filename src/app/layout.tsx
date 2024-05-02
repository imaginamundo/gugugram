import "./globals.css";

import type { Metadata } from "next";
import { Silkscreen } from "next/font/google";

import CSPostHogProvider from "@/analytics/providers";
import AuthJsProvider from "@/components/AuthProvider";
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
    <AuthJsProvider>
      <CSPostHogProvider>
        <html lang="pt" className={silkcreen.className}>
          <body>
            <Header />
            {children}
            <Footer />
          </body>
        </html>
      </CSPostHogProvider>
    </AuthJsProvider>
  );
}
