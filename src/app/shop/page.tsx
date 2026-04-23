import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ShopClient from "@/components/shop/ShopClient";
import type { Product } from "@/types/product";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "The Collection",
  description:
    "Browse the complete Maison Lumière collection. Eight rare fragrances, each one a singular vision.",
  openGraph: {
    title: "The Collection | Maison Lumière",
    description:
      "Browse the complete Maison Lumière collection. Eight rare fragrances, each one a singular vision.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200&q=85",
        width: 1200,
        height: 630,
        alt: "Maison Lumière Collection",
      },
    ],
  },
};

export default async function ShopPage() {
  const raw = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
  });

  const products = raw as unknown as Product[];

  // Derive sorted unique categories from the data itself
  const categoryOrder = ["floral", "woody", "oriental", "fresh", "gourmand"];
  const presentCats = categoryOrder.filter((c) =>
    products.some((p) => p.category === c)
  );
  const categories = ["all", ...presentCats];

  return (
    <main className={styles.page}>
      {/* Page header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.eyebrow}>Maison Lumière</span>
          <h1 className={styles.title}>The Collection</h1>
          <p className={styles.subtitle}>
            Eight rare fragrances. Each one a singular vision.
          </p>
        </div>
      </header>

      {/* Shop content */}
      <section className={styles.content}>
        <div className={styles.contentInner}>
          <ShopClient products={products} categories={categories} />
        </div>
      </section>
    </main>
  );
}
