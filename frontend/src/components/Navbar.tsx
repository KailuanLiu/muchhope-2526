"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "../styles/navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "My Profile", href: "/Profile" },
    { label: "Volunteer", href: "/Volunteer" },
    // don't have events implemented
    { label: "My Events", href: "/MyEvents" },
    { label: "Upcoming Events", href: "/Events/Upcoming" },
    { label: "Past Events", href: "/Events/Past" },
    { label: "About Us", href: "/About" },
    { label: "Contact", href: "/ContactUs" },
    // donate also not implemented
    { label: "Donate", href: "/Donate" },
  ];

  return (
    <nav className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <button className={styles.toggleButton} onClick={() => setCollapsed(!collapsed)}>
        ☰
      </button>
      <ul className={styles.navList}>
        {navItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={`${styles.navLink} ${pathname === item.href ? styles.active : ""}`}>
              <span className={styles.linkText}>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles.signOut}>
        <button className={styles.signOutButton}>
          <span className={styles.linkText}>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
