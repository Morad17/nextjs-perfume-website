import Link from "next/link";
import styles from "./Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <span className={styles.logo}>Maison Lumière</span>
            <p className={styles.tagline}>
              Rare, handcrafted fragrances for those who seek the extraordinary.
            </p>
          </div>

          <nav className={styles.links}>
            <div className={styles.linkGroup}>
              <span className={styles.groupTitle}>Explore</span>
              <Link href="/shop">Collection</Link>
              <Link href="/shop?category=featured">New Arrivals</Link>
              <Link href="/about">Our Story</Link>
            </div>
            <div className={styles.linkGroup}>
              <span className={styles.groupTitle}>Support</span>
              <Link href="/shipping">Shipping</Link>
              <Link href="/returns">Returns</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {new Date().getFullYear()} Maison Lumière. All rights reserved.
          </p>
          <div className={styles.legal}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
