import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { AuroraBackground } from "@/components/aurora-background";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Bira Party - El Evento del Año",
  description: "Valida tu código de invitación y accede a Bira Party. Tu experiencia comienza aquí.",
  keywords: ["fiesta", "evento", "Bira Party", "entradas", "exclusivo", "música", "entretenimiento"],
  authors: [{ name: "Bira Party" }],
  creator: "Bira Party",
  publisher: "Bira Party",
  metadataBase: new URL('https://biraparty.lat'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: '/',
    title: "Bira Party - El Evento del Año",
    description: "Valida tu código de invitación y accede a Bira Party. Tu experiencia comienza aquí.",
    siteName: "Bira Party",
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Bira Party',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Bira Party - El Evento del Año",
    description: "Valida tu código de invitación y accede a Bira Party. Tu experiencia comienza aquí.",
    images: ['/logo.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${poppins.className} antialiased`}>
        <Providers>
          <AuroraBackground>
            {children}
          </AuroraBackground>
        </Providers>
      </body>
    </html>
  );
}
