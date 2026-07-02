"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import VolunteerNavbar from "../components/volunteer/VolunteerNavbar";
import AdminNavbar from "../components/admin/AdminNavbar";
import Navbar from "../components/Navbar";
import styles from "../styles/landingPage.module.css";
import Footer from "../components/Footer";

interface AuthLayoutProps {
  children: ReactNode;
  onCollapse?: (collapsed: boolean) => void;
  hideFooter?: boolean;
}

export default function AuthLayout({ children, onCollapse, hideFooter }: AuthLayoutProps) {
  const { isSignedIn, isLoaded, sessionClaims } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const role = sessionClaims?.metadata?.role as string | undefined;

  function handleCollapse(value: boolean) {
    setCollapsed(value);
    onCollapse?.(value);
  }

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent background scroll while the mobile drawer is open.
  useEffect(() => {
    if (mobileOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileOpen]);

  const showSidebar = isLoaded && isSignedIn;
  const isAdmin = role === "admin" || role === "mainadmin";

  return (
    <div className={styles.pageLayout}>
      {!isLoaded ? null : !isSignedIn ? (
        <Navbar />
      ) : (
        <>
          {/* Mobile top bar with hamburger — only shown on small screens via CSS */}
          <div className={styles.mobileTopBar}>
            <button
              type="button"
              className={styles.mobileMenuButton}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <img src="/icons/menu.svg" alt="" />
            </button>
            <img src="/white-logo.png" alt="Much Hope" className={styles.mobileTopBarLogo} />
          </div>

          {/* Backdrop behind the drawer */}
          {mobileOpen && (
            <div className={styles.mobileBackdrop} onClick={() => setMobileOpen(false)} aria-hidden="true" />
          )}

          {isAdmin ? (
            <AdminNavbar
              collapsed={collapsed}
              setCollapsed={handleCollapse}
              mobileOpen={mobileOpen}
              onMobileClose={() => setMobileOpen(false)}
            />
          ) : (
            <VolunteerNavbar
              collapsed={collapsed}
              setCollapsed={handleCollapse}
              mobileOpen={mobileOpen}
              onMobileClose={() => setMobileOpen(false)}
            />
          )}
        </>
      )}

      <main
        data-collapsed={collapsed}
        className={`${styles.mainContent} ${
          !showSidebar ? "" : collapsed ? styles.mainContentCollapsed : styles.mainContentExpanded
        }`}
      >
        {children}
        {!hideFooter && <Footer />}
      </main>
    </div>
  );
}
