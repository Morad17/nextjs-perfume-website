import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, Cinzel } from "next/font/google";
import { BasketProvider } from "@/context/BasketContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BasketDrawer from "@/components/layout/BasketDrawer";
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
    default: "Jauhar Oud — Luxury Perfumery",
    template: "%s | Jauhar Oud",
  },
  description:
    "Rare, handcrafted fragrances for those who seek the extraordinary. Discover the Maison Lumière collection.",
  openGraph: {
    type: "website",
    siteName: "Maison Lumière",
    title: "Maison Lumière — Luxury Perfumery",
    description:
      "Rare, handcrafted fragrances for those who seek the extraordinary. Discover the Maison Lumière collection.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200&q=85",
        width: 1200,
        height: 630,
        alt: "Maison Lumière — Luxury Perfumery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maison Lumière — Luxury Perfumery",
    description:
      "Rare, handcrafted fragrances for those who seek the extraordinary.",
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200&q=85",
    ],
  },
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
          <PageTransition>{children}</PageTransition>
          <Footer />
          <BasketDrawer />
        </BasketProvider>
      </body>
    </html>
  );
}
