"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import VolunteerNavbar from "../components/volunteer/VolunteerNavbar";
import AdminNavbar from "../components/admin/AdminNavbar";
import Navbar from "../components/Navbar";
import styles from "../styles/landingPage.module.css";

interface AuthLayoutProps {
  children: React.ReactNode;
  onCollapse?: (collapsed: boolean) => void;
}

export default function AuthLayout({ children, onCollapse }: AuthLayoutProps) {
  const { isSignedIn, isLoaded, sessionClaims } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const role = (sessionClaims?.metadata?.role as string | undefined) ?? "user";

  function handleCollapse(value: boolean) {
    setCollapsed(value);
    onCollapse?.(value);
  }

  return (
    <div className={styles.pageLayout}>
      {isLoaded ? (
        isSignedIn ? (
          role === "admin" || role === "mainadmin" ? (
            <AdminNavbar collapsed={collapsed} setCollapsed={handleCollapse} />
          ) : (
            <VolunteerNavbar collapsed={collapsed} setCollapsed={handleCollapse} />
          )
        ) : (
          <Navbar />
        )
      ) : null}

      <main
        data-collapsed={collapsed}
        className={`${styles.mainContent} ${
          !isSignedIn || !isLoaded ? "" : collapsed ? styles.mainContentCollapsed : styles.mainContentExpanded
        }`}
      >
        {children}
      </main>
    </div>
  );
}
