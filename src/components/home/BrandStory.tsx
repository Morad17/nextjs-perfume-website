"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import styles from "./BrandStory.module.scss";

const STORY_IMAGE =
  "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=900&q=85";

export default function BrandStory() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Text fades from dim to full opacity as the section enters
  const textOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7], [0.15, 1, 1]);

  // Image moves upward at a slower rate than the scroll — creates parallax depth
  const imageY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);

  // Gold line grows from 0 to full width
  const lineScale = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        {/* ── Left: text ─────────────────────────────────────────── */}
        <motion.div className={styles.textSide} style={{ opacity: textOpacity }}>
          <span className={styles.eyebrow}>Our Philosophy</span>

          {/* Animated gold line */}
          <motion.div
            className={styles.line}
            style={{ scaleX: lineScale, transformOrigin: "left" }}
          />

          <blockquote className={styles.quote}>
            "A great fragrance is not merely scent — it is emotion distilled,
            memory crystallised, identity made invisible."
          </blockquote>

          <p className={styles.body}>
            Founded on the belief that perfumery is the highest form of art,
            Maison Lumière works with the world&apos;s finest raw ingredients.
            Every formula is the work of years. Every bottle, a singular vision.
          </p>

          <Link href="/about" className={styles.link}>
            Discover the Maison
            <span className={styles.arrow}>→</span>
          </Link>
        </motion.div>

        {/* ── Right: image with parallax ─────────────────────────── */}
        <div className={styles.imageSide}>
          <motion.div className={styles.imageInner} style={{ y: imageY }}>
            <Image
              src={STORY_IMAGE}
              alt="The Maison Lumière atelier — handcrafting each fragrance"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.image}
            />
          </motion.div>

          {/* Decorative frame accent */}
          <motion.div
            className={styles.frameAccent}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </div>
      </div>
    </section>
  );
}
