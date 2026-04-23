"use client";

import { motion } from "framer-motion";
import styles from "./FilterBar.module.scss";

interface FilterBarProps {
  categories: string[];
  selected: string;
  onChange: (cat: string) => void;
  counts: Record<string, number>;
}

export default function FilterBar({
  categories,
  selected,
  onChange,
  counts,
}: FilterBarProps) {
  return (
    <div className={styles.bar} role="group" aria-label="Filter by category">
      {categories.map((cat) => {
        const isActive = selected === cat;
        const label = cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1);
        const count = cat === "all"
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[cat] ?? 0;

        return (
          <button
            key={cat}
            className={`${styles.pill} ${isActive ? styles.active : ""}`}
            onClick={() => onChange(cat)}
            aria-pressed={isActive}
          >
            {label}
            <span className={styles.count}>{count}</span>

            {/* Shared layout indicator slides between active pills */}
            {isActive && (
              <motion.div
                layoutId="filter-indicator"
                className={styles.indicator}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
