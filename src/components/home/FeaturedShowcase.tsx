"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { Product } from "@/types/product";
import SmokeCanvas from "./SmokeCanvas";
import styles from "./FeaturedShowcase.module.scss";

// Smoke colour palettes keyed by product slug.
// Add an entry here when a new product gets its 3-layer scenes.
const SMOKE_COLORS: Record<string, { h: number; s: number; l: number }[]> = {
  "wardat-al-jabal": [
    { h: 272, s: 65, l: 68 }, // purple
    { h: 250, s: 58, l: 74 }, // lavender
    { h: 295, s: 52, l: 70 }, // violet
    { h: 318, s: 48, l: 73 }, // dusty pink
  ],
  "dukhan-al-arz": [
    { h: 25,  s: 55, l: 55 }, // amber
    { h: 15,  s: 50, l: 50 }, // deep orange
    { h: 40,  s: 45, l: 60 }, // warm gold
  ],
  "zahr-al-lemon": [
    { h: 55,  s: 80, l: 72 }, // lemon yellow
    { h: 35,  s: 70, l: 70 }, // golden
    { h: 75,  s: 60, l: 68 }, // lime green
  ],
};

const DEFAULT_SMOKE = [{ h: 200, s: 50, l: 70 }];

interface Props {
  product: Product;
}

export default function FeaturedShowcase({ product }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Each layer moves at a different rate — back slowest, front fastest
  const scene3Y = useTransform(
    scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [40,  -40],
  );
  const scene2Y = useTransform(
    scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [100, -100],
  );
  const bottleY = useTransform(
    scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [60,  -60],
  );
  const scene1Y = useTransform(
    scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [160, -160],
  );

  // Info fades in as you start scrolling
  const infoOpacity = useTransform(scrollYProgress, [0, 0.18], [0, 1]);
  const infoY      = useTransform(scrollYProgress, [0, 0.18], [24, 0]);

  // Scroll cue fades out once scrolling begins
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  const smokeColors = SMOKE_COLORS[product.slug] ?? DEFAULT_SMOKE;

  return (
    <div ref={containerRef} className={styles.stickyOuter}>
      <div ref={innerRef} className={styles.stickyInner}>

        {/* ── Scene layer 3: opaque background ──────────────────────── */}
        <motion.div className={styles.layer} style={{ y: scene3Y, zIndex: 1 }}>
          <Image
            src={`/images/scenes/${product.slug}-3.png`}
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
          />
        </motion.div>

        {/* ── Scene layer 2: transparent mid-ground ─────────────────── */}
        <motion.div className={styles.layer} style={{ y: scene2Y, zIndex: 2 }}>
          <Image
            src={`/images/scenes/${product.slug}-2.png`}
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
          />
        </motion.div>

        {/* ── Perfume bottle: centred, in front of mid-ground ─────────── */}
        <motion.div
          className={styles.bottleWrapper}
          style={{ y: bottleY, zIndex: 3 }}
        >
          <div className={styles.bottle}>
            <Image
              src={`/images/products/${product.imageUrl}`}
              alt={product.imageAlt}
              fill
              sizes="(max-width: 768px) 55vw, 25vw"
              style={{ objectFit: "contain", objectPosition: "bottom center" }}
              priority
            />
          </div>
        </motion.div>

        {/* ── Scene layer 1: transparent foreground (over bottle) ───── */}
        <motion.div className={styles.layer} style={{ y: scene1Y, zIndex: 4 }}>
          <Image
            src={`/images/scenes/${product.slug}-1.png`}
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
          />
        </motion.div>

        {/* ── Mouse smoke effect (above all image layers) ────────────── */}
        {!prefersReducedMotion && (
          <SmokeCanvas colors={smokeColors} targetRef={innerRef} />
        )}

        {/* ── Info overlay ───────────────────────────────────────────── */}
        <motion.div
          className={styles.infoPanel}
          style={{ opacity: infoOpacity, y: infoY }}
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

        {/* ── Scroll cue ─────────────────────────────────────────────── */}
        <motion.div className={styles.scrollCue} style={{ opacity: cueOpacity }}>
          <span className={styles.scrollLabel}>Scroll</span>
          <span className={styles.scrollLine} />
        </motion.div>

      </div>
    </div>
  );
}
