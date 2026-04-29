"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import styles from "@/styles/adminnavbar.module.css";

export default function AdminNavbar({
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
    { label: "Home", href: "/admin", icon: "/icons/house-chimney-floor.svg" },
    { label: "My Profile", href: "/admin/profile", icon: "/icons/user-alt-1.svg" },
    { label: "Manage Events", href: "/Admin/Events", icon: "/icons/calendar-lines-pen.svg" },
    { label: "Manage Users", href: "/admin/manage-users", icon: "/icons/users.svg" },

    // TODO: make about us and contact us editable and make sure its connected to the backend
    { label: "About Us", href: "/About", icon: "/icons/circle-information.svg" },
    { label: "Contact Us", href: "/ContactUs", icon: "/icons/send-icon.svg" },
  ];

  return (
    <nav className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.topSection}>
        <button className={styles.toggleButton} onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
          <img src="/icons/menu.svg" alt="menu button" />
        </button>
      </div>

      <ul className={styles.navList}>
        {navItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={`${styles.navLink} ${pathname === item.href ? styles.active : ""}`}>
              {item.icon && <img src={item.icon} alt="" className={styles.icon} />}
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
