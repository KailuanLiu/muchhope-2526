"use client";

import Link from "next/link";
import styles from "../styles/landingPage.module.css";

export default function LandingPage() {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.overlay}>
        <h1 className={styles.title}>MuchHope</h1>
        <p className={styles.subtitle}>Providing resources and support for the homeless community in San Jose.</p>

        <Link href="/Auth/Login" className={styles.ctaButton}>
          Get Involved
        </Link>
      </div>
    </div>
  );
}
