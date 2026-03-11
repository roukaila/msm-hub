import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import CartSidebar from "@/components/CartSidebar";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MSM Hub",
  description: "MSM Hub — Connecter vendeurs, clients et livraison propulsé par msm-conseils.",
  keywords: ["MSM Hub", "msm-conseils", "Marketplace Algérie", "E-commerce Algérie", "Achat en ligne", "Vente en ligne dz"],
  openGraph: {
    title: "MSM Hub",
    description: "MSM Hub — Connecter vendeurs, clients et livraison propulsé par msm-conseils.",
    locale: "fr_DZ",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${plusJakartaSans.variable} ${plusJakartaSans.className} antialiased overflow-x-hidden min-h-screen relative`}
      >
        {children}
        <CartSidebar />
      </body>
    </html>

  );
}
