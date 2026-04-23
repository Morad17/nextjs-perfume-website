import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";
import type { Product } from "@/types/product";
import styles from "./FeaturedProducts.module.scss";

export default async function FeaturedProducts() {
  const raw = await prisma.product.findMany({
    where: { featured: true },
    orderBy: { createdAt: "asc" },
  });

  const products = raw as unknown as Product[];

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {/* Heading */}
        <div className={styles.heading}>
          <span className={styles.eyebrow}>The Collection</span>
          <h2 className={styles.title}>Featured Fragrances</h2>
          <p className={styles.subtitle}>
            Curated selections from our most celebrated works.
          </p>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={i < 2}
            />
          ))}
        </div>

        {/* View all link */}
        <div className={styles.footer}>
          <a href="/shop" className={styles.viewAll}>
            View entire collection
            <span className={styles.arrow}>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
