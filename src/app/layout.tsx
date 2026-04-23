import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, Cinzel } from "next/font/google";
import { BasketProvider } from "@/context/BasketContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/ui/PageTransition";
import "./globals.scss";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Maison Lumière — Luxury Perfumery",
    template: "%s | Maison Lumière",
  },
  description:
    "Rare, handcrafted fragrances for those who seek the extraordinary. Discover the Maison Lumière collection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${montserrat.variable} ${cinzel.variable}`}
    >
      <body>
        <BasketProvider>
          <Navbar />
          <PageTransition>
            {children}
          </PageTransition>
          <Footer />
        </BasketProvider>
      </body>
    </html>
  );
}
