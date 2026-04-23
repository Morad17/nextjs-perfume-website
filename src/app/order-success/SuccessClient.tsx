"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useBasket } from "@/context/BasketContext";
import styles from "./order-success.module.scss";

interface SuccessClientProps {
  sessionId?: string;
}

export default function SuccessClient({ sessionId }: SuccessClientProps) {
  const { clearBasket } = useBasket();

  // Clear basket once on mount
  useEffect(() => {
    clearBasket();
  }, [clearBasket]);

  return (
    <main className={styles.page}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      >
        {/* Animated checkmark */}
        <div className={styles.iconWrap}>
          <motion.svg
            viewBox="0 0 52 52"
            className={styles.checkSvg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <motion.circle
              cx="26"
              cy="26"
              r="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                delay: 0.3,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              }}
            />
            <motion.path
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 27 l9 9 l16 -17"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                delay: 0.75,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              }}
            />
          </motion.svg>
        </div>

        <motion.div
          className={styles.text}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h1 className={styles.title}>Order Confirmed</h1>
          <p className={styles.subtitle}>
            Thank you for your purchase. Your fragrances are being prepared with care.
          </p>

          {sessionId && (
            <p className={styles.orderRef}>
              Reference:{" "}
              <span className={styles.sessionId}>
                {sessionId.slice(0, 24)}…
              </span>
            </p>
          )}

          <p className={styles.emailNote}>
            A confirmation email is on its way to you.
          </p>
        </motion.div>

        <motion.div
          className={styles.actions}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <Link href="/shop" className={styles.shopBtn}>
            Continue Shopping
          </Link>
          <Link href="/" className={styles.homeLink}>
            Return Home
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
