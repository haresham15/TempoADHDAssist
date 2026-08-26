"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, Settings } from "lucide-react";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.navBar}>
      <div className={styles.navInner}>
        <Link href="/" className={`${styles.navItem} ${pathname === "/" ? styles.active : ""}`}>
          <Home className={styles.icon} strokeWidth={pathname === "/" ? 2.5 : 1.75} />
        </Link>
        <Link href="/history" className={`${styles.navItem} ${pathname === "/history" ? styles.active : ""}`}>
          <Clock className={styles.icon} strokeWidth={pathname === "/history" ? 2.5 : 1.75} />
        </Link>
        <Link href="/settings" className={`${styles.navItem} ${pathname === "/settings" ? styles.active : ""}`}>
          <Settings className={styles.icon} strokeWidth={pathname === "/settings" ? 2.5 : 1.75} />
        </Link>
      </div>
    </nav>
  );
}
