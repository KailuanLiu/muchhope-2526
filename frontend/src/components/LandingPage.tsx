"use client";

import styles from "@/styles/landingPage.module.css";

export default function LandingPage() {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.overlay}>
        <h1 className={styles.title}>MuchHope</h1>
        <p className={styles.subtitle}>Providing resources and support for the homeless community in San Jose.</p>
        <a href="/signup" className={styles.ctaButton}>
          Get Involved
        </a>
      </div>
    </div>
  );
}
