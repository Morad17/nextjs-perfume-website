"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { ScentNotes as ScentNotesType } from "@/types/product";
import styles from "./ScentNotes.module.scss";

interface ScentNotesProps {
  notes: ScentNotesType;
}

const pillVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.07,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const lineVariants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: {
      duration: 0.6,
      delay: 0.2,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

function NoteGroup({
  label,
  notes,
  baseDelay,
  inView,
}: {
  label: string;
  notes: string[];
  baseDelay: number;
  inView: boolean;
}) {
  return (
    <div className={styles.group}>
      <span className={styles.groupLabel}>{label}</span>
      <div className={styles.pills}>
        {notes.map((note, i) => (
          <motion.span
            key={note}
            className={styles.pill}
            variants={pillVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            custom={baseDelay + i}
          >
            {note}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

export default function ScentNotes({ notes }: ScentNotesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>Scent Pyramid</span>
        <motion.div
          className={styles.titleLine}
          variants={lineVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{ transformOrigin: "left" }}
        />
      </div>

      <div className={styles.pyramid}>
        {/* Vertical connector line */}
        <motion.div
          className={styles.connector}
          variants={{
            hidden: { scaleY: 0 },
            visible: {
              scaleY: 1,
              transition: { duration: 0.7, delay: 0.3, ease: "easeOut" as const },
            },
          }}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{ transformOrigin: "top" }}
        />

        {/* Top notes — fewest, open the fragrance */}
        <NoteGroup
          label="Top"
          notes={notes.top}
          baseDelay={0}
          inView={inView}
        />

        {/* Heart notes — the core character */}
        <NoteGroup
          label="Heart"
          notes={notes.heart}
          baseDelay={notes.top.length + 2}
          inView={inView}
        />

        {/* Base notes — the lasting impression */}
        <NoteGroup
          label="Base"
          notes={notes.base}
          baseDelay={notes.top.length + notes.heart.length + 4}
          inView={inView}
        />
      </div>
    </div>
  );
}
