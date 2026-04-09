"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../styles/navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "My Profile", href: "/profile" },
    { label: "Volunteer", href: "/volunteer" },
    { label: "Upcoming Events", href: "/events/upcoming" },
    { label: "Past Events", href: "/events/past" },
    { label: "About Us", href: "/About" },
    { label: "Contact", href: "/ContactUs" },
    { label: "Donate", href: "/donate" },
  ];

  return (
    <nav className={styles.sidebar}>
      <ul className={styles.navList}>
        {navItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={`${styles.navLink} ${pathname === item.href ? styles.active : ""}`}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles.signOut}>
        <button className={styles.signOutButton}>Sign Out</button>
      </div>
    </nav>
  );
}
