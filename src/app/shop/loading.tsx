import styles from "./loading.module.scss";

function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.cardImage} />
      <div className={styles.cardBody}>
        <div className={`${styles.line} ${styles.lineName}`} />
        <div className={`${styles.line} ${styles.lineCategory}`} />
        <div className={`${styles.line} ${styles.linePrice}`} />
      </div>
    </div>
  );
}

export default function ShopLoading() {
  return (
    <main className={styles.page}>
      {/* Header skeleton */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={`${styles.line} ${styles.lineEyebrow}`} />
          <div className={`${styles.line} ${styles.lineTitle}`} />
          <div className={`${styles.line} ${styles.lineSub}`} />
        </div>
      </header>

      {/* Filter bar skeleton */}
      <div className={styles.filterBar}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.filterPill} />
        ))}
      </div>

      {/* Grid skeleton */}
      <section className={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </section>
    </main>
  );
}
