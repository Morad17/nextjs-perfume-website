"use client";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import type { Product } from "@/types/product";
import styles from "./FeaturedShowcase.module.scss";

interface Props {
  products: Product[];
}

const EASE = [0.22, 1, 0.36, 1] as const;

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: EASE },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -40,
    transition: { duration: 0.5, ease: EASE },
  }),
};

export default function FeaturedShowcase({ products }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 60, damping: 20, mass: 1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const bgX = useTransform(smoothX, [-0.5, 0.5], [-30, 30]);
  const bgY = useTransform(smoothY, [-0.5, 0.5], [-20, 20]);
  const fgX = useTransform(smoothX, [-0.5, 0.5], [-70, 70]);
  const fgY = useTransform(smoothY, [-0.5, 0.5], [-50, 50]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (prefersReducedMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY, prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const goNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((i) => (i + 1) % products.length);
  }, [products.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((i) => (i - 1 + products.length) % products.length);
  }, [products.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
    },
    [goNext, goPrev]
  );

  const product = products[activeIndex];
  const showNav = products.length > 1;

  const bgStyle = prefersReducedMotion ? {} : { x: bgX, y: bgY };
  const fgStyle = prefersReducedMotion ? {} : { x: fgX, y: fgY };

  return (
    <section
      className={styles.showcase}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Featured Fragrances"
    >
      {/* Image layers — whole slide transitions together */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={product.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className={styles.slidePair}
        >
          <motion.div className={styles.bgLayer} style={bgStyle}>
            <Image
              src={`/images/scenes/${product.slug}-scene.png`}
              alt=""
              fill
              sizes="100vw"
              style={{ objectFit: "cover" }}
              priority={activeIndex === 0}
            />
          </motion.div>

          <div className={styles.bgOverlay} />

          <motion.div className={styles.fgLayer} style={fgStyle}>
            <Image
              src={`/images/products/${product.imageUrl}`}
              alt={product.imageAlt}
              fill
              sizes="(max-width: 768px) 50vw, 30vw"
              style={{ objectFit: "contain", objectPosition: "bottom center" }}
              priority={activeIndex === 0}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Info panel — animates independently from images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`info-${product.id}`}
          className={styles.infoPanel}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6, ease: EASE }}
          aria-roledescription="slide"
          aria-label={`${product.name}, ${activeIndex + 1} of ${products.length}`}
        >
          <span className={styles.eyebrow}>{product.category}</span>
          <h2 className={styles.productName}>{product.name}</h2>
          <p className={styles.description}>{product.description}</p>
          {product.scentNotes && (
            <ul className={styles.scentNotes}>
              {[
                ...product.scentNotes.top.slice(0, 2),
                ...product.scentNotes.heart.slice(0, 1),
              ].map((note) => (
                <li key={note} className={styles.pill}>
                  {note}
                </li>
              ))}
            </ul>
          )}
          <Link href={`/product/${product.slug}`} className={styles.buyLink}>
            Explore Fragrance <span className={styles.arrow}>→</span>
          </Link>
        </motion.div>
      </AnimatePresence>

      {showNav && (
        <nav className={styles.arrowNav} aria-label="Carousel navigation">
          <button
            className={styles.arrowBtn}
            onClick={goPrev}
            aria-label="Previous fragrance"
          >
            ↑
          </button>
          <button
            className={styles.arrowBtn}
            onClick={goNext}
            aria-label="Next fragrance"
          >
            ↓
          </button>
        </nav>
      )}

      {showNav && (
        <div className={styles.dotNav} role="tablist" aria-label="Slides">
          {products.map((p, i) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`${p.name}, slide ${i + 1}`}
              className={`${styles.dot}${i === activeIndex ? ` ${styles.dotActive}` : ""}`}
              onClick={() => {
                setDirection(i > activeIndex ? 1 : -1);
                setActiveIndex(i);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
