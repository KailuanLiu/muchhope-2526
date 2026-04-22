"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import styles from "../styles/volunteernavbar.module.css";

export default function AppNavbar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  const navItems = [
    { label: "Home", href: "/", icon: "/icons/home.svg" },
    { label: "My Profile", href: "/Profile", icon: "/icons/User.svg" },
    { label: "Volunteer", href: "/Volunteer" },
    // don't have events implemented
    { label: "My Events", href: "/MyEvents" },
    { label: "Upcoming Events", href: "/Events/Upcoming" },
    { label: "Past Events", href: "/Events/PastEvents" },
    { label: "About Us", href: "/About" },
    { label: "Contact Us", href: "/ContactUs" },
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
              <img src={item.icon} alt="" className={styles.icon} />
              <span className={styles.linkText}>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles.signOut}>
        <button className={styles.signOutButton} onClick={handleSignOut}>
          <span className={styles.linkText}>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
