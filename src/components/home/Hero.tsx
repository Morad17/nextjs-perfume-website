"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AnimatedText from "@/components/ui/AnimatedText";
import styles from "./Hero.module.scss";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=900&q=85";

export default function Hero() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const prefersReducedMotion = useReducedMotion();

  // Generate particles after mount to avoid hydration mismatch
  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        duration: Math.random() * 8 + 7,
        delay: Math.random() * 5,
      }))
    );
  }, []);

  return (
    <section className={styles.hero}>
      {/* Floating gold particles */}
      {!prefersReducedMotion &&
        particles.map((p) => (
          <motion.span
            key={p.id}
            className={styles.particle}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -18, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

      <div className={styles.grid}>
        {/* ── Left: content ──────────────────────────────────────────── */}
        <div className={styles.content}>
          {/* Eyebrow */}
          <motion.span
            className={styles.eyebrow}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            New Collection — 2025
          </motion.span>

          {/* Headline: words animate up one by one */}
          <AnimatedText
            text="The Art of Pure Scent"
            el="h1"
            className={styles.headline}
            delay={0.2}
          />

          {/* Gold divider */}
          <motion.div
            className={styles.divider}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 0.8,
              delay: 1.1,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
            style={{ transformOrigin: "left" }}
          />

          {/* Subtitle */}
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.3 }}
          >
            Rare, handcrafted fragrances for those who seek the extraordinary.
            Each bottle a story. Each scent a memory.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className={styles.ctas}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.5 }}
          >
            <Link href="/shop" className={styles.ctaPrimary}>
              Explore Collection
            </Link>
            <Link href="/about" className={styles.ctaGhost}>
              Our Story
            </Link>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            className={styles.scrollCue}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
          >
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              ↓
            </motion.span>
          </motion.div>
        </div>

        {/* ── Right: image ────────────────────────────────────────────── */}
        <motion.div
          className={styles.imageWrap}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 1,
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          }}
        >
          {/* Wipe reveal overlay */}
          <motion.div
            className={styles.wipe}
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.5,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
            style={{ transformOrigin: "right" }}
          />

          <Image
            src={HERO_IMAGE}
            alt="Maison Lumière — luxury perfume collection"
            fill
            priority
            className={styles.image}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </motion.div>
      </div>
    </section>
  );
}
