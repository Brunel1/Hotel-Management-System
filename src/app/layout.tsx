import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProviders } from "@/components/ThemeProviders";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { NotificationProvider } from "@/components/NotificationProvider";
import MobileNavigation from "@/components/MobileNavigation";
import { LanguageProvider } from "@/components/LanguageProvider";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestion Hôtelière - Système de réservation en ligne",
  description: "Système de gestion hôtelière complet avec réservation en ligne, gestion des chambres, facturation et tableau de bord administratif",
  keywords: "hôtel, réservation, gestion, chambre, booking, hôtelier",
  authors: [{ name: "Gestion Hôtelière" }],
  creator: "Gestion Hôtelière",
  publisher: "Gestion Hôtelière",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Gestion Hôtelière - Système de réservation en ligne",
    description: "Système de gestion hôtelière complet avec réservation en ligne",
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: "Gestion Hôtelière",
    locale: "fr_FR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {process.env.NEXT_PUBLIC_GA_ID && (
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            strategy="afterInteractive"
          />
        )}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}
          </Script>
        )}
        <ThemeProviders>
          <LanguageProvider>
            <NotificationProvider>
              {children}
              <GoogleAnalytics />
              <ServiceWorkerRegistration />
              <MobileNavigation />
            </NotificationProvider>
          </LanguageProvider>
        </ThemeProviders>
      </body>
    </html>
  );
}
