"use client";

import { AnimatePresence, motion } from "framer-motion";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/product";
import styles from "./ProductGrid.module.scss";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <motion.div className={styles.grid} layout>
      <AnimatePresence mode="popLayout">
        {products.map((product) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
          >
            {/* skipEntrance: this motion.div handles entry, not ProductCard */}
            <ProductCard product={product} skipEntrance />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
