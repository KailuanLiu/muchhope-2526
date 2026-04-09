"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "../styles/navbar.module.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.link}>
        Home
      </Link>

      <Link href="/About" className={styles.link}>
        About Us
      </Link>

      <Link href="/" className={styles.logo}>
        Logo
      </Link>

      <Link href="/ContactUs" className={styles.link}>
        Contact Us
      </Link>

      <div className={styles.dropdownWrapper}>
        <button className={styles.moreButton} onClick={() => setOpen(!open)}>
          More
        </button>

        <div className={`${styles.dropdown} ${open ? styles.show : ""}`}>
          <Link href="/Auth/Login" className={styles.dropdownItem}>
            Sign Up / Login
          </Link>
          <Link href="/Events" className={styles.dropdownItem}>
            Events
          </Link>
          <Link href="/Donate" className={styles.dropdownItem}>
            Donate
          </Link>
        </div>
      </div>
    </nav>
  );
}
