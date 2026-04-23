"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useBasket } from "@/context/BasketContext";
import { formatPrice } from "@/lib/utils";
import styles from "./checkout.module.scss";

export default function CheckoutPage() {
  const { items, totalItems, totalPrice, closeDrawer } = useBasket();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      closeDrawer();
      router.push(data.url);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className={styles.empty}>
        <motion.div
          className={styles.emptyInner}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          <span className={styles.emptyIcon}>◎</span>
          <h1 className={styles.emptyTitle}>Your basket is empty</h1>
          <p className={styles.emptySub}>
            Add some fragrances before proceeding to checkout.
          </p>
          <Link href="/shop" className={styles.shopLink}>
            Explore the Collection →
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      >
        {/* Page heading */}
        <header className={styles.header}>
          <h1 className={styles.title}>Review Your Order</h1>
          <p className={styles.subtitle}>
            {totalItems} {totalItems === 1 ? "item" : "items"} ready for checkout
          </p>
        </header>

        <div className={styles.layout}>
          {/* Item list */}
          <section className={styles.itemsSection}>
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={`${item.productId}-${item.size}`}
                  className={styles.item}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.imageWrap}>
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className={styles.image}
                    />
                  </div>
                  <div className={styles.itemDetails}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemMeta}>
                      {item.size}ml · Qty {item.quantity}
                    </p>
                  </div>
                  <p className={styles.itemPrice}>
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </section>

          {/* Summary + CTA */}
          <aside className={styles.summary}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>

              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={styles.muted}>Calculated at checkout</span>
              </div>
              <div className={styles.divider} />
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Estimated Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    className={styles.error}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                className={styles.checkoutBtn}
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.spinner} />
                ) : (
                  "Proceed to Checkout"
                )}
              </button>

              <Link href="/shop" className={styles.continueLink}>
                Continue Shopping
              </Link>
            </div>
          </aside>
        </div>
      </motion.div>
    </main>
  );
}
