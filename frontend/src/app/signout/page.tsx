"use client";

import { useClerk } from "@clerk/nextjs";
import styles from "../../styles/signup.module.css";

export default function SignOutPage() {
  const { signOut } = useClerk();

  const handleSignOut = () => {
    signOut({ redirectUrl: "/" });
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Sign Out</h1>
      <div className={styles.formBox}>
        <h2 className={styles.formTitle}>Are you sure you want to sign out?</h2>
        <button className={styles.button} onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
