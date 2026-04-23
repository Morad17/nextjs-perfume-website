"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useBasket } from "@/context/BasketContext";
import { formatPrice } from "@/lib/utils";
import type { BasketItem as BasketItemType } from "@/types/basket";
import styles from "./BasketItem.module.scss";

interface BasketItemProps {
  item: BasketItemType;
}

export default function BasketItem({ item }: BasketItemProps) {
  const { removeItem, updateQuantity } = useBasket();

  return (
    <motion.div
      className={styles.item}
      layout
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
    >
      {/* Thumbnail */}
      <div className={styles.imageWrap}>
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="72px"
          className={styles.image}
        />
      </div>

      {/* Details */}
      <div className={styles.details}>
        <div className={styles.top}>
          <div>
            <p className={styles.name}>{item.name}</p>
            <p className={styles.size}>{item.size}ml</p>
          </div>

          {/* Remove */}
          <button
            className={styles.removeBtn}
            onClick={() => removeItem(item.productId, item.size)}
            aria-label={`Remove ${item.name} from basket`}
          >
            ×
          </button>
        </div>

        <div className={styles.bottom}>
          {/* Quantity controls */}
          <div className={styles.qty}>
            <button
              className={styles.qtyBtn}
              onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
              aria-label="Decrease quantity"
              disabled={item.quantity <= 1}
            >
              −
            </button>
            <span className={styles.qtyNum}>{item.quantity}</span>
            <button
              className={styles.qtyBtn}
              onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Line price */}
          <p className={styles.price}>{formatPrice(item.price * item.quantity)}</p>
        </div>
      </div>
    </motion.div>
  );
}
