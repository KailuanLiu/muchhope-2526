"use client";

import styles from "../styles/about.module.css";
import AuthLayout from "@/app/AuthLayout";
import { useRouter } from "next/navigation";

export default function About() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/ContactUs");
  };
  return (
    <AuthLayout>
      <div className={styles.aboutContainer}>
        <h2 className={styles.aboutTitle}> About Us </h2>
        <img src="/event-photos/about-us-page.jpg" alt="about us" className={styles.aboutImage} />
        <p className={styles.aboutDescription}>
          {" "}
          Like most metropolitan areas, San Jose California has a large homeless population. This under-served segment
          of the community has a continuing need for food, clothing, personal hygiene materials, some form of shelter,
          and Christian love. The dedicated staff of Much Hope endeavors to provide for the physical needs of the
          homeless community by purchasing needed materials with self-contributed funds. Emotional and spiritual needs
          are addressed by conversation and – whenever possible - prayer with each homeless person. The needs of the
          homeless far exceed the financial resources of the Much Hope staff. A contribution will increase the scope and
          effectiveness of this important ministry.
        </p>
      </div>
      <div className={styles.aboutContactContainer}>
        <img src="/placeholder.jpg" alt="placeholder" className={styles.aboutContactImage} />

        <div className={styles.aboutContactInfo}>
          <h2 className={styles.aboutContactTitle}> Meet Our Organizer </h2>
          <h2 className={styles.organizerTitle}> Sujanna Panthulu </h2>
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
