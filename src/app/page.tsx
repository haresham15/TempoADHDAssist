"use client";

import { useRouter } from "next/navigation";
import { useTempo } from "@/lib/TempoContext";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const { userName } = useTempo();

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome, {userName}.</h1>
        <p className={styles.subtitle}>What is your tempo right now?</p>
      </header>

      <div className={styles.intentGrid}>
        <button 
          className={`${styles.intentButton} ${styles.btnOverwhelm}`}
          onClick={() => router.push("/overwhelmed")}
        >
          <div className={styles.iconWrapper}>🧩</div>
          I&apos;m Overwhelmed
        </button>

        <button 
          className={`${styles.intentButton} ${styles.btnTrigger}`}
          onClick={() => router.push("/triggered")}
        >
          <div className={styles.iconWrapper}>🛡️</div>
          I&apos;m Triggered
        </button>

        <button 
          className={`${styles.intentButton} ${styles.btnVent}`}
          onClick={() => router.push("/vent")}
        >
          <div className={styles.iconWrapper}>🎙️</div>
          I Need to Vent
        </button>
      </div>
    </main>
  );
}
