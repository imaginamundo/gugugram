import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Silkscreen } from "next/font/google";

import AddPicture from "@/components/AddPicture";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CSPostHogProvider from "@/providers/Analytics";
import AuthJsProvider from "@/providers/AuthProvider";
import Toaster from "@/providers/Toaster";

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
            <AddPicture />
            <Toaster />
          </body>
        </html>
      </CSPostHogProvider>
    </AuthJsProvider>
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL as string),
  applicationName: "Gugugram",
  title: {
    template: "%s · Gugugram",
    default: "Gugugram",
  },
  description: "É uma rede social",
  category: "social network",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/seo/icon-16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/seo/icon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/seo/icon-180.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        url: "/seo/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/seo/icon.png",
        sizes: "500x500",
        type: "image/png",
      },
      {
        url: "/seo/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    title: "Gugugram",
    statusBarStyle: "black-translucent",
    startupImage: [
      "/seo.png",
      {
        url: "/seo/startup-1536.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
  openGraph: {
    title: "Gugugram",
    description: "É uma rede social",
    siteName: "Gugugram",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/seo/og.png`,
        width: 800,
        height: 600,
        alt: "Gugugram, uma rede social",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gugugram",
    description: "É uma rede social",
    creator: "@bomdiadio",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/seo/og.png`],
  },
  manifest: `${process.env.NEXT_PUBLIC_BASE_URL}/manifest.json`,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#D7EBFF" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
};
