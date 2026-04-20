"use client";

import styles from "../styles/about.module.css";
import AuthLayout from "../app/AuthLayout";
import { useRouter } from "next/navigation";

export default function About() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/ContactUs");
  };
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
      <div className={styles.aboutContactContainer}>
        <img src="/placeholder.jpg" alt="placeholder" className={styles.aboutContactImage} />

        <div className={styles.aboutContactInfo}>
          <h2 className={styles.aboutContactTitle}> Sujana </h2>
          <p className={styles.aboutContactDesc}>
            {" "}
            Information about Sujana. The dedicated staff of Much Hope endeavors to provide for the physical needs of
            the homeless community by purchasing needed materials with self-contributed funds. Emotional and spiritual
            needs are addressed by conversation and - whenever possible - prayer with each homeless person.{" "}
          </p>
          <button type="button" onClick={handleClick} className={styles.aboutContactButton}>
            Contact
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
