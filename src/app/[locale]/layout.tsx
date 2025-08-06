import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Camille Labasse D.O - Ostéopathe à Lisbonne",
  description: "Réservez votre consultation d'ostéopathie en ligne avec Camille Labasse, ostéopathe D.O à Lisbonne. Spécialiste en ostéopathie tissulaire, aquatique et pédiatrique.",
  keywords: "ostéopathe, Lisbonne, réservation, consultation, ostéopathie aquatique, pédiatrique",
};

interface RootLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default async function RootLayout({
  children,
  params
}: RootLayoutProps) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}