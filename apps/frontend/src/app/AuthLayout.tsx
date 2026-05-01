"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, type ReactNode } from "react";
import VolunteerNavbar from "../components/volunteer/VolunteerNavbar";
import AdminNavbar from "../components/admin/AdminNavbar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "../styles/landingPage.module.css";

interface AuthLayoutProps {
  children: ReactNode;
  onCollapse?: (collapsed: boolean) => void;
}

export default function AuthLayout({ children, onCollapse }: AuthLayoutProps) {
  const { isSignedIn, isLoaded, sessionClaims } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const role = sessionClaims?.metadata?.role as string | undefined;
  const isAdmin = role === "admin" || role === "mainadmin";
  const hasSidebar = isLoaded && isSignedIn && isAdmin;

  function handleCollapse(value: boolean) {
    setCollapsed(value);
    onCollapse?.(value);
  }

  useEffect(() => {
    console.log("Auth state changed:", { isLoaded, isSignedIn, sessionClaims, role });
  }, [isLoaded, isSignedIn, sessionClaims, role]);

  const shiftClass = !hasSidebar ? "" : collapsed ? styles.mainContentCollapsed : styles.mainContentExpanded;

  const footerShiftClass = !hasSidebar ? "" : collapsed ? styles.footerCollapsed : styles.footerExpanded;

  return (
    <div className={styles.pageLayout}>
      {!isLoaded ? null : !isSignedIn ? (
        <Navbar />
      ) : isAdmin ? (
        <AdminNavbar collapsed={collapsed} setCollapsed={handleCollapse} />
      ) : (
        <VolunteerNavbar collapsed={collapsed} setCollapsed={handleCollapse} />
      )}

      <main data-collapsed={collapsed} className={`${styles.mainContent} ${shiftClass}`}>
        {children}
      </main>

      <div className={footerShiftClass}>
        <Footer />
      </div>
    </div>
  );
}
