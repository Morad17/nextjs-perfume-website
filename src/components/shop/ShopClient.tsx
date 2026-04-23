"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FilterBar from "./FilterBar";
import ProductGrid from "./ProductGrid";
import type { Product } from "@/types/product";
import styles from "./ShopClient.module.scss";

interface ShopClientProps {
  products: Product[];
  categories: string[];
}

export default function ShopClient({ products, categories }: ShopClientProps) {
  const [selected, setSelected] = useState("all");

  const filtered =
    selected === "all"
      ? products
      : products.filter((p) => p.category === selected);

  // Count per category for the pill badges
  const counts = categories.reduce<Record<string, number>>((acc, cat) => {
    if (cat !== "all") {
      acc[cat] = products.filter((p) => p.category === cat).length;
    }
    return acc;
  }, {});

  return (
    <div className={styles.shopClient}>
      {/* Filter bar */}
      <div className={styles.filterRow}>
        <FilterBar
          categories={categories}
          selected={selected}
          onChange={setSelected}
          counts={counts}
        />

        {/* Result count */}
        <motion.span
          key={filtered.length}
          className={styles.resultCount}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filtered.length} {filtered.length === 1 ? "fragrance" : "fragrances"}
        </motion.span>
      </div>

      {/* Product grid */}
      <ProductGrid products={filtered} />
    </div>
  );
}
