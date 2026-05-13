"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useState } from "react";
import styles from "@/styles/sidebar.module.css";
import volStyles from "../../styles/volunteernavbar.module.css";

export default function VolunteerNavbar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [eventsOpen, setEventsOpen] = useState(false);
  const isMyEventsActive =
    pathname === "/Events/Upcoming" || pathname === "/Events/PastEvents" || pathname === "/Volunteer";

  async function handleSignOut() {
    console.log("signed out");
    await signOut({ redirectUrl: "/auth/login" });
  }

  const navItems = [
    { label: "Home", href: "/", icon: "/icons/house-chimney-floor.svg" },
    { label: "My Profile", href: "/Profile", icon: "/icons/user-alt-1.svg" },
    { label: "About Us", href: "/About", icon: "/icons/circle-information.svg" },
    { label: "Contact Us", href: "/ContactUs", icon: "/icons/send-icon.svg" },
    { label: "Donate", href: "/Donate", icon: "/icons/heart-alt.svg" },
  ];

  const eventItems = [
    { label: "Upcoming", href: "/Events/Upcoming" },
    { label: "Past", href: "/Events/PastEvents" },
    { label: "Volunteer", href: "/Volunteer" },
  ];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.topSection}>
        <button className={styles.toggleButton} onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
          <img src="/icons/menu.svg" alt="menu button" />
        </button>
      </div>

      {!collapsed && (
        <div className={styles.logoBox}>
          <Image src="/white-logo.png" alt="Much Hope" width={200} height={170} className={styles.logo} />
        </div>
      )}

      <nav className={volStyles.navArea}>
        <ul className={styles.navList}>
          {navItems.slice(0, 2).map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={`${styles.navLink} ${pathname === item.href ? styles.active : ""}`}>
                <img src={item.icon} alt="" className={volStyles.icon} />
                {!collapsed && <span className={styles.linkText}>{item.label}</span>}
              </Link>
            </li>
          ))}

          <li>
            <button
              type="button"
              className={`${styles.navLink} ${volStyles.dropdownToggle} ${isMyEventsActive ? styles.active : ""}`}
              onClick={() => setEventsOpen(!eventsOpen)}
            >
              <img src="/icons/calendar-check.svg" alt="" className={volStyles.icon} />
              {!collapsed && (
                <>
                  <span className={styles.linkText}>My Events</span>
                  <img
                    src={eventsOpen ? "/icons/chevron-down.svg" : "/icons/chevron-right.svg"}
                    alt=""
                    className={volStyles.chevron}
                  />
                </>
              )}
            </button>

            {!collapsed && eventsOpen && (
              <ul className={volStyles.submenu}>
                {eventItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`${volStyles.submenuLink} ${pathname === item.href ? volStyles.subActive : ""}`}
                    >
                      <span className={volStyles.submenuBox}></span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {navItems.slice(2).map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={`${styles.navLink} ${pathname === item.href ? styles.active : ""}`}>
                <img src={item.icon} alt="" className={volStyles.icon} />
                {!collapsed && <span className={styles.linkText}>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={volStyles.bottomSection}>
        <button className={styles.signOutButton} onClick={handleSignOut}>
          {!collapsed && <span className={styles.linkText}>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
