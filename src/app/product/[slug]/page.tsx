import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { prisma } from "@/lib/prisma";
import ScentNotes from "@/components/product/ScentNotes";
import AddToBasket from "@/components/product/AddToBasket";
import type { Product } from "@/types/product";
import styles from "./page.module.scss";

// Pre-render every product page at build time
export async function generateStaticParams() {
  const products = await prisma.product.findMany({ select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}

// Per-product SEO metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};
  const description = (product.description as string).slice(0, 160);
  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} | Maison Lumière`,
      description,
      images: [
        {
          url: `${product.imageUrl}&w=1200&q=85`,
          width: 1200,
          height: 630,
          alt: product.imageAlt as string,
        },
      ],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const raw = await prisma.product.findUnique({ where: { slug } });
  if (!raw) notFound();

  const product = raw as unknown as Product;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        {/* ── Left: image ──────────────────────────────────────────── */}
        <div className={styles.imageSide}>
          <div className={styles.sticky}>
            {/* Breadcrumb */}
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/shop">Collection</Link>
              <span>/</span>
              <span>{product.name}</span>
            </nav>

            {/* Main image */}
            <div className={styles.imageWrap}>
              <div className={styles.imageInner}>
                <Image
                  src={product.imageUrl}
                  alt={product.imageAlt}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={styles.image}
                />
              </div>

              {/* Category badge */}
              <span className={styles.categoryBadge}>{product.category}</span>
            </div>
          </div>
        </div>

        {/* ── Right: product info ───────────────────────────────────── */}
        <div className={styles.infoSide}>
          {/* Header */}
          <div className={styles.productHeader}>
            <h1 className={styles.name}>{product.name}</h1>
            <p className={styles.tagline}>
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)} fragrance
            </p>
          </div>

          {/* Gold divider */}
          <div className={styles.divider} />

          {/* Description */}
          <p className={styles.description}>{product.description}</p>

          {/* Add to basket (client component — size selector + quantity + button) */}
          <AddToBasket product={product} />

          {/* Scent notes pyramid (client component — animated) */}
          <ScentNotes notes={product.scentNotes} />
        </div>
      </div>
    </main>
  );
}
