// src/app/about-us/page.tsx
import AuthLayout from "../AuthLayout";
import About from "../../components/About";
import styles from "../../styles/about.module.css";

export default function AboutUs() {
  return (
    <AuthLayout>
      <About />
      <div className={styles.aboutBanner}></div>
    </AuthLayout>
  );
}
