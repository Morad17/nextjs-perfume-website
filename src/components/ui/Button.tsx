"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import styles from "./Button.module.scss";

type Variant = "primary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
}

type ButtonProps = BaseProps &
  ComponentPropsWithoutRef<"button"> & { href?: undefined };

type LinkProps = BaseProps &
  ComponentPropsWithoutRef<typeof Link> & { href: string };

type Props = ButtonProps | LinkProps;

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className,
  children,
  ...rest
}: Props) {
  const cls = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : "",
    loading ? styles.loading : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...linkRest } = rest as LinkProps;
    return (
      <Link href={href} className={cls} {...(linkRest as object)}>
        <span className={styles.inner}>{children}</span>
        <span className={styles.shimmer} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <button
      className={cls}
      disabled={loading || (rest as ButtonProps).disabled}
      {...(rest as ComponentPropsWithoutRef<"button">)}
    >
      {loading ? (
        <span className={styles.spinner} />
      ) : (
        <>
          <span className={styles.inner}>{children}</span>
          <span className={styles.shimmer} aria-hidden="true" />
        </>
      )}
    </button>
  );
}
