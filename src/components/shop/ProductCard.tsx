"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";
import styles from "./ProductCard.module.scss";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  /** When true, skips the whileInView entrance — used when the parent grid handles animation */
  skipEntrance?: boolean;
}

export default function ProductCard({
  product,
  priority = false,
  skipEntrance = false,
}: ProductCardProps) {
  const entranceProps = skipEntrance
    ? {}
    : {
        initial: { opacity: 0, y: 32 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: {
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      };

  return (
    <motion.article className={styles.card} {...entranceProps}>
      <Link href={`/product/${product.slug}`} className={styles.inner}>
        {/* Image */}
        <div className={styles.imageWrap}>
          <motion.div
            className={styles.imageScale}
            whileHover={{ scale: 1.06 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
          >
            <Image
              src={product.imageUrl}
              alt={product.imageAlt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={styles.image}
              priority={priority}
            />
          </motion.div>

          {/* Hover overlay */}
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className={styles.exploreLabel}>Explore</span>
          </motion.div>
        </div>

        {/* Info */}
        <div className={styles.info}>
          <span className={styles.category}>{product.category}</span>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.price}>{formatPrice(product.price)}</p>
        </div>
      </Link>
    </motion.article>
  );
}
