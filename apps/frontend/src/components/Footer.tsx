import styles from "../styles/footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.copyright}>© {new Date().getFullYear()} Much Hope. All rights reserved.</p>
      <div className={styles.socialLinks}>
        <a
          href="https://www.facebook.com/MuchHopeSanJose/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.socialLink}
        >
          Much Hope on Facebook
        </a>
      </div>
    </footer>
  );
}
