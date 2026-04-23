import styles from "./loading.module.scss";

export default function ProductLoading() {
  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        {/* Image column */}
        <div className={styles.imageCol}>
          <div className={styles.mainImage} />
        </div>

        {/* Info column */}
        <div className={styles.infoCol}>
          <div className={`${styles.line} ${styles.lineCategory}`} />
          <div className={`${styles.line} ${styles.lineName}`} />
          <div className={`${styles.line} ${styles.linePrice}`} />

          <div className={styles.divider} />

          <div className={`${styles.line} ${styles.lineDesc1}`} />
          <div className={`${styles.line} ${styles.lineDesc2}`} />
          <div className={`${styles.line} ${styles.lineDesc3}`} />

          <div className={styles.divider} />

          {/* Size pills */}
          <div className={styles.sizes}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.sizePill} />
            ))}
          </div>

          <div className={styles.addBtn} />
        </div>
      </div>
    </main>
  );
}
