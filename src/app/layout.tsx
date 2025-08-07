import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Camille Labasse D.O - Ostéopathe à Lisbonne",
  description: "Réservez votre consultation d'ostéopathie en ligne avec Camille Labasse, ostéopathe D.O à Lisbonne.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}