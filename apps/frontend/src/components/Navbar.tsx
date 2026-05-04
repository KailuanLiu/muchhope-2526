"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "../styles/navbar.module.css";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/About", label: "About Us" },
  { href: "/Events/Upcoming", label: "Events" },
  { href: "/Donate", label: "Donate" },
  { href: "/ContactUs", label: "Contact Us" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
          Much Hope
        </Link>

        <ul className={`${styles.links} ${open ? styles.linksOpen : ""}`}>
          {navLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.link} ${pathname === item.href ? styles.active : ""}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className={styles.mobileCta}>
            <Link href="/auth/login" className={styles.ctaButton} onClick={() => setOpen(false)}>
              Login
            </Link>
          </li>
        </ul>

        <Link href="/auth/login" className={`${styles.ctaButton} ${styles.desktopCta}`}>
          Login
        </Link>

        <button
          type="button"
          className={styles.menuToggle}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className={`${styles.bar} ${open ? styles.barTop : ""}`} />
          <span className={`${styles.bar} ${open ? styles.barMid : ""}`} />
          <span className={`${styles.bar} ${open ? styles.barBot : ""}`} />
        </button>
      </div>
    </nav>
  );
}
