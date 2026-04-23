"use client";

import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  el?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
}

const wordVariants = {
  hidden: { y: "110%", opacity: 0 },
  visible: (i: number) => ({
    y: "0%",
    opacity: 1,
    transition: {
      duration: 0.7,
      delay: i * 0.08,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export default function AnimatedText({
  text,
  el: El = "h1",
  className,
  delay = 0,
}: AnimatedTextProps) {
  const words = text.split(" ");

  return (
    <El className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
        >
          <motion.span
            style={{ display: "inline-block" }}
            variants={wordVariants}
            initial="hidden"
            animate="visible"
            custom={i + delay / 0.08}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </El>
  );
}
