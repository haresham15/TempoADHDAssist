import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandRow}>
          <span className={styles.tagline}>Tempo — A quiet pause before you react.</span>
        </div>
        <nav className={styles.navRow} aria-label="Secondary navigation">
          <Link href="/about" className={styles.link}>About</Link>
          <span className={styles.dot}>•</span>
          <Link href="/faq" className={styles.link}>FAQ</Link>
          <span className={styles.dot}>•</span>
          <Link href="/suggestions" className={styles.link}>Suggestions</Link>
          <span className={styles.dot}>•</span>
          <Link href="/settings" className={styles.link}>Settings</Link>
          <span className={styles.dot}>•</span>
          <a 
            href="https://988lifeline.org" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.crisisLink}
            title="Free, confidential 24/7 mental health crisis support"
          >
            Crisis Support (988)
          </a>
        </nav>
        <p className={styles.disclaimer}>
          Personal communication buffer. Not a substitute for clinical therapy or emergency medical care.
        </p>
      </div>
    </footer>
  );
}
