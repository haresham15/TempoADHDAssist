"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessagesSquare, ListTree, Mic, Sparkles } from "lucide-react";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      title: "Home Intent Hub",
    },
    {
      href: "/triggered",
      label: "Buffer",
      icon: MessagesSquare,
      title: "RSD Communication Buffer",
    },
    {
      href: "/overwhelmed",
      label: "Tasks",
      icon: ListTree,
      title: "Task Chunker",
    },
    {
      href: "/vent",
      label: "Vent",
      icon: Mic,
      title: "Voice Journal",
    },
    {
      href: "/history",
      label: "Insights",
      icon: Sparkles,
      title: "Pattern Insights & History",
    },
  ];

  return (
    <nav className={styles.navBar} aria-label="Main navigation">
      <div className={styles.navInner}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              aria-label={item.title}
              aria-current={isActive ? "page" : undefined}
              title={item.title}
            >
              <div className={styles.iconContainer}>
                <Icon
                  className={styles.icon}
                  strokeWidth={isActive ? 2.3 : 1.7}
                />
              </div>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

