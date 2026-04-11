"use client";

import styles from "../styles/about.module.css";
import { useState } from "react";
import Navbar from "./AppNavbar";

export default function About() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={styles.pageLayout}>
      <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className={`${styles.mainContent} ${collapsed ? styles.mainContentCollapsed : styles.mainContentExpanded}`}>
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
      </main>
    </div>
  );
}
