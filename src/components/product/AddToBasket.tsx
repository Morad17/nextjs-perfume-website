"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBasket } from "@/context/BasketContext";
import { formatPrice } from "@/lib/utils";
import type { Product, ProductSize } from "@/types/product";
import styles from "./AddToBasket.module.scss";

interface AddToBasketProps {
  product: Product;
}

export default function AddToBasket({ product }: AddToBasketProps) {
  const [selectedSize, setSelectedSize] = useState<ProductSize>(
    product.sizes.find((s) => s.ml === 50) ?? product.sizes[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useBasket();

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      price: selectedSize.price,
      imageUrl: product.imageUrl,
      slug: product.slug,
      size: selectedSize.ml,
      quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className={styles.wrapper}>
      {/* Size selector */}
      <div className={styles.sizeSection}>
        <span className={styles.label}>Size</span>
        <div className={styles.sizes}>
          {product.sizes.map((size) => (
            <button
              key={size.ml}
              className={`${styles.sizeBtn} ${selectedSize.ml === size.ml ? styles.sizeActive : ""}`}
              onClick={() => setSelectedSize(size)}
              aria-pressed={selectedSize.ml === size.ml}
            >
              <span className={styles.sizeMl}>{size.ml}ml</span>
              <span className={styles.sizePrice}>{formatPrice(size.price)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className={styles.quantitySection}>
        <span className={styles.label}>Quantity</span>
        <div className={styles.quantityControl}>
          <button
            className={styles.qtyBtn}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className={styles.qtyValue}>{quantity}</span>
          <button
            className={styles.qtyBtn}
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Total */}
      <div className={styles.total}>
        <span className={styles.totalLabel}>Total</span>
        <motion.span
          key={`${selectedSize.ml}-${quantity}`}
          className={styles.totalPrice}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {formatPrice(selectedSize.price * quantity)}
        </motion.span>
      </div>

      {/* Add to basket button */}
      <motion.button
        className={`${styles.addBtn} ${added ? styles.addedBtn : ""}`}
        onClick={handleAdd}
        disabled={product.stock === 0}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <AnimatePresence mode="wait">
          {added ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={styles.btnText}
            >
              ✓ Added to Basket
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={styles.btnText}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Basket"}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Stock note */}
      {product.stock > 0 && product.stock <= 10 && (
        <p className={styles.stockWarning}>
          Only {product.stock} left in stock
        </p>
      )}
    </div>
  );
}
