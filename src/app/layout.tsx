import type { Metadata } from "next";
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
  title: "Bira - Tu experiencia comienza aquí",
  description: "Plataforma de invitaciones y gestión de eventos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
