"use client";

import styles from "../styles/about.module.css";
import AuthLayout from "../app/AuthLayout";

export default function About() {
  return (
    <AuthLayout>
      <div className={styles.aboutContainer}>
        <h1 className={styles.aboutTitle}> About Us</h1>
        <img src="/placeholder.jpg" alt="placeholder" className={styles.aboutImage} />
        <p className={styles.aboutDescription}>
          {" "}
          The dedicated staff of Much Hope endeavors to provide for the physical needs of the homeless community by
          purchasing needed materials with self-contributed funds. Emotional and spiritual needs are addressed by
          conversation and - whenever possible - prayer with each homeless person.
        </p>
      </div>
    </AuthLayout>
  );
}
