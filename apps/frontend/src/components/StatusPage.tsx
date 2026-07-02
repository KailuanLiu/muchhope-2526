"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import styles from "../styles/statusPage.module.css";

interface StatusPageProps {
  /** Large status code shown at the top, e.g. "404" or "403". */
  code?: string;
  /** Short heading describing the situation. */
  title: string;
  /** Longer explanation shown to the user. */
  message: string;
}

/**
 * Reusable full-screen status page (used for 404 Not Found and 403
 * Unauthorized). Gives the user a clear way to navigate back a page or return
 * to a sensible home destination based on their role.
 */
export default function StatusPage({ code, title, message }: StatusPageProps) {
  const router = useRouter();
  const { isLoaded, isSignedIn, sessionClaims } = useAuth();

  const role = sessionClaims?.metadata?.role as string | undefined;
  const isAdmin = role === "admin" || role === "mainadmin";

  // Signed-in admins belong on /admin, everyone else on /.
  const homeHref = isLoaded && isSignedIn && isAdmin ? "/admin" : "/";

  function handleGoBack() {
    // Prefer going back a page when there is history; otherwise fall back home.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(homeHref);
    }
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <img src="/color-logo.png" alt="Much Hope" className={styles.logo} />

        {code && <p className={styles.code}>{code}</p>}
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button type="button" className={styles.primaryButton} onClick={handleGoBack}>
            Go back
          </button>
          <Link href={homeHref} className={styles.secondaryButton}>
            {isAdmin ? "Go to dashboard" : "Go to home"}
          </Link>
        </div>

        <p className={styles.helpText}>
          Need help? <Link href="/ContactUs">Contact us</Link>
        </p>
      </div>
    </div>
  );
}
