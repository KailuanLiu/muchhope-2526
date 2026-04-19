"use client";

import styles from "../styles/about_contact.module.css";
import { useRouter } from "next/navigation";

export default function AboutContact() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/ContactUs");
  };

  return (
    <div className={styles.aboutContactContainer}>
      <img src="/placeholder.jpg" alt="placeholder" className={styles.aboutContactImage} />

      <div className={styles.aboutContactInfo}>
        <h2 className={styles.aboutContactTitle}> Sujana </h2>
        <p className={styles.aboutContactDesc}>
          {" "}
          Information about Sujana. The dedicated staff of Much Hope endeavors to provide for the physical needs of the
          homeless community by purchasing needed materials with self-contributed funds. Emotional and spiritual needs
          are addressed by conversation and - whenever possible - prayer with each homeless person.{" "}
        </p>
        <button type="button" onClick={handleClick} className={styles.aboutContactButton}>
          Contact
        </button>
      </div>
    </div>
  );
}
