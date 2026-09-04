"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessagesSquare, Sparkles } from "lucide-react";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.navBar} aria-label="Main navigation">
      <div className={styles.navInner}>
        <Link 
          href="/" 
          className={`${styles.navItem} ${pathname === "/" ? styles.active : ""}`}
          aria-label="Home Intent Hub"
          title="Home"
        >
          <Home className={styles.icon} strokeWidth={pathname === "/" ? 2.3 : 1.7} />
          <span className={styles.navLabel}>Home</span>
        </Link>

        <Link 
          href="/triggered" 
          className={`${styles.navItem} ${pathname === "/triggered" ? styles.active : ""}`}
          aria-label="RSD Communication Buffer"
          title="RSD Buffer"
        >
          <MessagesSquare className={styles.icon} strokeWidth={pathname === "/triggered" ? 2.3 : 1.7} />
          <span className={styles.navLabel}>Buffer</span>
        </Link>

        <Link 
          href="/history" 
          className={`${styles.navItem} ${pathname === "/history" ? styles.active : ""}`}
          aria-label="History and Pattern Insights"
          title="Insights"
        >
          <Sparkles className={styles.icon} strokeWidth={pathname === "/history" ? 2.3 : 1.7} />
          <span className={styles.navLabel}>Insights</span>
        </Link>
      </div>
    </nav>
  );
}
