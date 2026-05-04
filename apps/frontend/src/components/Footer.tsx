"use client";

// src/components/Footer.tsx

import Link from "next/link";
import styles from "@/styles/footer.module.css";

function FacebookIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <p className={styles.logo}>Much Hope</p>
            <p className={styles.tagline}>
              Connecting volunteers with meaningful opportunities to make a difference in our community.
            </p>

            <div className={styles.socials}>
              <a
                href="https://www.facebook.com/MuchHopeSanJose/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Much Hope on Facebook"
              >
                <FacebookIcon />
                <span>Much Hope on Facebook</span>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionTitle}>Navigation</p>
            <nav className={styles.linkList}>
              <Link href="/" className={styles.link}>
                Home
              </Link>
              <Link href="/events?view=upcoming" className={styles.link}>
                Upcoming Events
              </Link>
              <Link href="/events?view=past" className={styles.link}>
                Past Events
              </Link>
              <Link href="/volunteer" className={styles.link}>
                Volunteer
              </Link>
              <Link href="/about-us" className={styles.link}>
                About Us
              </Link>
            </nav>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionTitle}>Contact</p>
            <div className={styles.contactList}>
              <div className={styles.contactRow}>
                <EmailIcon />
                <span>hello@muchhope.org</span>
              </div>
              <div className={styles.contactRow}>
                <PhoneIcon />
                <span>(805) 555-0142</span>
              </div>
              <div className={styles.contactRow}>
                <LocationIcon />
                <span>San Luis Obispo, CA</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>Copyright ©2018 Altos Christian Foundation. All Rights Reserved.</p>

          <div className={styles.bottomLinks}>
            <Link href="/privacy" className={styles.bottomLink}>
              Privacy Policy
            </Link>
            <Link href="/terms" className={styles.bottomLink}>
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
