import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Silkscreen } from "next/font/google";

import CSPostHogProvider from "@/analytics/providers";
import AuthJsProvider from "@/components/AuthProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL as string),
  applicationName: "Gugugram",
  title: {
    template: "%s · Gugugram",
    default: "Gugugram", // a default is required when creating a template
  },
  description: "É uma rede social",
  category: "social network",
  icons: {
    icon: "/seo/icon.png",
    shortcut: "/seo/icon.png",
    apple: "/seo/icon-180.png",
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
            <head>
              <link rel="icon" href="/favicon.ico" type="image/x-icon" />
            </head>
            <Header />
            {children}
            <Footer />
          </body>
        </html>
      </CSPostHogProvider>
    </AuthJsProvider>
  );
}
