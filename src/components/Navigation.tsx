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
      title: "Tempo Intent Hub",
      module: "home",
    },
    {
      href: "/triggered",
      label: "Buffer",
      icon: MessagesSquare,
      title: "RSD Communication Buffer",
      module: "buffer",
    },
    {
      href: "/overwhelmed",
      label: "Tasks",
      icon: ListTree,
      title: "Task Chunker & Spatial Spotlight",
      module: "tasks",
    },
    {
      href: "/vent",
      label: "Vent",
      icon: Mic,
      title: "Sensory Vent & Soundscape",
      module: "vent",
    },
    {
      href: "/history",
      label: "Insights",
      icon: Sparkles,
      title: "Pattern Insights & Safe History",
      module: "insights",
    },
  ];

  return (
    <nav className={styles.navBar} aria-label="Primary navigation">
      <div className={styles.navInner}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${styles[item.module]} ${isActive ? styles.active : ""}`}
              aria-label={item.title}
              aria-current={isActive ? "page" : undefined}
              title={item.title}
            >
              <div className={styles.iconContainer}>
                <Icon
                  className={styles.icon}
                  strokeWidth={isActive ? 2.2 : 1.7}
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
