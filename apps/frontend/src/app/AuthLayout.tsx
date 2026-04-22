"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import AppNavbar from "../components/AppNavbar";
import Navbar from "../components/Navbar";
import styles from "../styles/landingPage.module.css";

interface AuthLayoutProps {
  children: React.ReactNode;
  onCollapse?: (collapsed: boolean) => void;
}

export default function AuthLayout({ children, onCollapse }: AuthLayoutProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  function handleCollapse(value: boolean) {
    setCollapsed(value);
    onCollapse?.(value);
  }
  return (
    <div className={styles.pageLayout}>
      {isLoaded && (isSignedIn ? <AppNavbar collapsed={collapsed} setCollapsed={handleCollapse} /> : <Navbar />)}
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
