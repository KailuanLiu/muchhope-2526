"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, type ReactNode } from "react";
import VolunteerNavbar from "../components/volunteer/VolunteerNavbar";
import AdminNavbar from "../components/admin/AdminNavbar";
import Navbar from "../components/Navbar";
import styles from "../styles/landingPage.module.css";
import Footer from "../components/Footer";

interface AuthLayoutProps {
  children: ReactNode;
  onCollapse?: (collapsed: boolean) => void;
}

export default function AuthLayout({ children, onCollapse }: AuthLayoutProps) {
  const { isSignedIn, isLoaded, sessionClaims } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const role = sessionClaims?.metadata?.role as string | undefined;

  function handleCollapse(value: boolean) {
    setCollapsed(value);
    onCollapse?.(value);
  }

  useEffect(() => {
    console.log("Auth state changed:", {
      isLoaded,
      isSignedIn,
      sessionClaims,
      role,
    });
  }, [isLoaded, isSignedIn, sessionClaims, role]);

  return (
    <div className={styles.pageLayout}>
      {!isLoaded ? null : !isSignedIn ? (
        <Navbar />
      ) : role === "admin" || role === "mainadmin" ? (
        <AdminNavbar collapsed={collapsed} setCollapsed={handleCollapse} />
      ) : (
        <VolunteerNavbar collapsed={collapsed} setCollapsed={handleCollapse} />
      )}

      <main
        data-collapsed={collapsed}
        className={`${styles.mainContent} ${
          !isSignedIn || !isLoaded ? "" : collapsed ? styles.mainContentCollapsed : styles.mainContentExpanded
        }`}
      >
        {children}
        <Footer />
      </main>
    </div>
  );
}
