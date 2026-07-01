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
      <div className={styles.page}>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>About Us</h1>
          <p className={styles.heroSubtitle}>
            Serving the homeless community in San Jose with compassion, dignity, and care.
          </p>
        </section>

        <section className={styles.aboutCard}>
          <div className={styles.aboutImageWrap}>
            <img src="/event-photos/about-us-page.jpg" alt="Much Hope volunteers" className={styles.aboutImage} />
          </div>
          <div className={styles.aboutText}>
            <span className={styles.eyebrow}>Our Mission</span>
            <p className={styles.aboutDescription}>
              Like most metropolitan areas, San Jose California has a large homeless population. This under-served
              segment of the community has a continuing need for food, clothing, personal hygiene materials, some form
              of shelter, and Christian love. The dedicated staff of Much Hope endeavors to provide for the physical
              needs of the homeless community by purchasing needed materials with self-contributed funds. Emotional and
              spiritual needs are addressed by conversation and – whenever possible – prayer with each homeless person.
              The needs of the homeless far exceed the financial resources of the Much Hope staff. A contribution will
              increase the scope and effectiveness of this important ministry.
            </p>
          </div>
        </section>

        <section className={styles.organizerCard}>
          <img src="/placeholder.jpg" alt="Sujana Panthulu" className={styles.aboutContactImage} />

          <div className={styles.aboutContactInfo}>
            <span className={styles.eyebrow}>Meet Our Organizer</span>
            <h2 className={styles.organizerTitle}>Sujana Panthulu</h2>
            <p className={styles.aboutContactDesc}>
              Information about Sujana. The dedicated staff of Much Hope endeavors to provide for the physical needs of
              the homeless community by purchasing needed materials with self-contributed funds. Emotional and spiritual
              needs are addressed by conversation and – whenever possible – prayer with each homeless person.
            </p>
            <button type="button" onClick={handleClick} className={styles.aboutContactButton}>
              Get in Touch
            </button>
          </div>
        </section>
      </div>
    </AuthLayout>
  );
}
