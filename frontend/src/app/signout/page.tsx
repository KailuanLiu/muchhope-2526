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
      <div className={styles.formBox}>
        <button className={styles.button} onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
