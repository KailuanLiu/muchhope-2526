"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import styles from "@/styles/sidebar.module.css";
import adminStyles from "@/styles/adminnavbar.module.css";

export default function AdminNavbar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [eventsOpen, setEventsOpen] = useState(false);
  const [donationsOpen, setDonationsOpen] = useState(false);

  const isManageEventsActive = pathname === "/Events/Upcoming" || pathname === "/Events/PastEvents";
  const isManageDonationsActive = pathname === "/admin/donations" || pathname === "/Donate";

  async function handleSignOut() {
    await signOut({ redirectUrl: "/auth/login" });
  }

  const navItemsBefore = [
    { label: "Home", href: "/admin", icon: "/icons/house-chimney-floor.svg" },
    { label: "My Profile", href: "/admin/profile", icon: "/icons/user-alt-1.svg" },
  ];

  const navItemsAfter = [
    { label: "Manage Users", href: "/admin/manage-users", icon: "/icons/users.svg" },
    { label: "About Us", href: "/About", icon: "/icons/circle-information.svg" },
    { label: "Contact Us", href: "/ContactUs", icon: "/icons/send-icon.svg" },
  ];

  const eventItems = [
    { label: "Upcoming", href: "/Events/Upcoming" },
    { label: "Past", href: "/Events/PastEvents" },
  ];

  const donationItems = [
    { label: "Records", href: "/admin/donations" },
    { label: "Make Donation", href: "/Donate" },
  ];

  return (
    <nav className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={adminStyles.topSection}>
        <button className={styles.toggleButton} onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
          <img src="/icons/menu.svg" alt="menu button" />
        </button>
        {!collapsed && <Image src="/white-logo.png" alt="Much Hope" width={80} height={68} className={styles.logo} />}
      </div>

      <ul className={styles.navList}>
        {navItemsBefore.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={`${styles.navLink} ${pathname === item.href ? styles.active : ""}`}>
              {item.icon && <img src={item.icon} alt="" className={styles.icon} />}
              <span className={styles.linkText}>{item.label}</span>
            </Link>
          </li>
        ))}

        <li>
          <button
            type="button"
            className={`${styles.navLink} ${adminStyles.dropdownToggle} ${isManageEventsActive ? styles.active : ""}`}
            onClick={() => setEventsOpen(!eventsOpen)}
          >
            <img src="/icons/calendar-lines-pen.svg" alt="" className={styles.icon} />
            {!collapsed && (
              <>
                <span className={styles.linkText}>Manage Events</span>
                <img
                  src={eventsOpen ? "/icons/chevron-down.svg" : "/icons/chevron-right.svg"}
                  alt=""
                  className={adminStyles.chevron}
                />
              </>
            )}
          </button>

          {!collapsed && eventsOpen && (
            <ul className={adminStyles.submenu}>
              {eventItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${adminStyles.submenuLink} ${pathname === item.href ? adminStyles.subActive : ""}`}
                  >
                    <span className={adminStyles.submenuBox}></span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>

        <li>
          <button
            type="button"
            className={`${styles.navLink} ${adminStyles.dropdownToggle} ${isManageDonationsActive ? styles.active : ""}`}
            onClick={() => setDonationsOpen(!donationsOpen)}
          >
            <img src="/icons/heart-alt.svg" alt="" className={styles.icon} />
            {!collapsed && (
              <>
                <span className={styles.linkText}>Manage Donations</span>
                <img
                  src={donationsOpen ? "/icons/chevron-down.svg" : "/icons/chevron-right.svg"}
                  alt=""
                  className={adminStyles.chevron}
                />
              </>
            )}
          </button>

          {!collapsed && donationsOpen && (
            <ul className={adminStyles.submenu}>
              {donationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${adminStyles.submenuLink} ${pathname === item.href ? adminStyles.subActive : ""}`}
                  >
                    <span className={adminStyles.submenuBox}></span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>

        {navItemsAfter.map((item) => (
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
