"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useBasket } from "@/context/BasketContext";
import { formatPrice } from "@/lib/utils";
import BasketItem from "./BasketItem";
import styles from "./BasketDrawer.module.scss";

const panelVariants = {
  hidden: {
    x: "100%",
    transition: { duration: 0.35, ease: [0.32, 0, 0.67, 0] as [number, number, number, number] },
  },
  visible: {
    x: "0%",
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export default function BasketDrawer() {
  const { isDrawerOpen, closeDrawer, items, totalItems, totalPrice } = useBasket();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            className={styles.panel}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            role="dialog"
            aria-label="Your basket"
            aria-modal="true"
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <h2 className={styles.title}>Your Basket</h2>
                {totalItems > 0 && (
                  <span className={styles.count}>{totalItems} {totalItems === 1 ? "item" : "items"}</span>
                )}
              </div>
              <button
                className={styles.closeBtn}
                onClick={closeDrawer}
                aria-label="Close basket"
              >
                ×
              </button>
            </div>

            {/* Items */}
            <div className={styles.body}>
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    key="empty"
                    className={styles.empty}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className={styles.emptyIcon}>◎</span>
                    <p className={styles.emptyTitle}>Your basket is empty</p>
                    <p className={styles.emptySubtitle}>
                      Discover our collection and find your signature scent.
                    </p>
                    <Link href="/shop" className={styles.shopLink} onClick={closeDrawer}>
                      Explore the Collection →
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div key="items" layout className={styles.itemList}>
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <BasketItem
                          key={`${item.productId}-${item.size}`}
                          item={item}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer — only shown when there are items */}
            <AnimatePresence>
              {items.length > 0 && (
                <motion.div
                  className={styles.footer}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Subtotal */}
                  <div className={styles.subtotal}>
                    <span className={styles.subtotalLabel}>Subtotal</span>
                    <motion.span
                      key={totalPrice}
                      className={styles.subtotalPrice}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formatPrice(totalPrice)}
                    </motion.span>
                  </div>

                  <p className={styles.shippingNote}>
                    Shipping calculated at checkout
                  </p>

                  {/* Checkout CTA */}
                  <Link
                    href="/checkout"
                    className={styles.checkoutBtn}
                    onClick={closeDrawer}
                  >
                    Proceed to Checkout
                  </Link>

                  <button className={styles.continueBtn} onClick={closeDrawer}>
                    Continue Shopping
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
