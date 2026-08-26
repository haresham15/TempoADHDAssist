"use client";

import { useRouter } from "next/navigation";
import { useTempo } from "@/lib/TempoContext";
import { ListTree, MessagesSquare, AudioLines } from "lucide-react";
import BrandHeader from "@/components/BrandHeader";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const { userName } = useTempo();

  return (
    <main className={`page-container ${styles.container}`}>
      <BrandHeader />
      
      <header className={styles.header}>
        <h1 className={styles.title}>Hi {userName}</h1>
        <p className={styles.subtitle}>How&apos;s your head feeling right now?</p>
      </header>

      <div className={styles.intentList}>
        <button 
          className={`${styles.intentCard} ${styles.cardOverwhelm}`}
          onClick={() => router.push('/overwhelmed')}
        >
          <div className={styles.iconWrapper}>
            <ListTree className={styles.icon} strokeWidth={1.75} />
          </div>
          <div className={styles.cardContent}>
            <h2>I&apos;m overwhelmed</h2>
            <p>Let&apos;s break it down</p>
          </div>
        </button>

        <button 
          className={`${styles.intentCard} ${styles.cardTriggered}`}
          onClick={() => router.push('/triggered')}
        >
          <div className={styles.iconWrapper}>
            <MessagesSquare className={styles.icon} strokeWidth={1.75} />
          </div>
          <div className={styles.cardContent}>
            <h2>I&apos;m triggered</h2>
            <p>Let&apos;s find the words</p>
          </div>
        </button>

        <button 
          className={`${styles.intentCard} ${styles.cardVent}`}
          onClick={() => router.push('/vent')}
        >
          <div className={styles.iconWrapper}>
            <AudioLines className={styles.icon} strokeWidth={1.75} />
          </div>
          <div className={styles.cardContent}>
            <h2>I need to vent</h2>
            <p>Just talk, I&apos;m listening</p>
          </div>
        </button>
      </div>
    </main>
  );
}
