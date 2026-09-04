"use client";

import { useRouter } from "next/navigation";
import { useTempo } from "@/lib/TempoContext";
import { MessagesSquare, ListTree, AudioLines, Sparkles, Zap, Mic } from "lucide-react";
import BrandHeader from "@/components/BrandHeader";
import styles from "./page.module.css";

export default function Home() {
  const { userName } = useTempo();
  const router = useRouter();

  return (
    <main className={`page-container ${styles.container}`}>
      <BrandHeader />
      
      <header className={styles.header}>
        <h1 className={styles.greeting}>
          {userName ? `Hi ${userName}` : "Take a breath"}
        </h1>
        <p className={styles.subtitle}>A quiet space before you react.</p>
      </header>

      <div className={styles.intentList}>
        {/* Flagship Hero: RSD Communication Buffer */}
        <button 
          type="button"
          className={`${styles.intentCard} ${styles.cardTriggered} ${styles.cardPrimary}`}
          onClick={() => router.push('/triggered')}
        >
          <div className={styles.cardHeaderRow}>
            <span className={styles.flagshipBadge}>
              <Sparkles size={12} strokeWidth={2.5} /> Flagship Buffer
            </span>
          </div>
          <div className={styles.cardMainRow}>
            <div className={styles.iconWrapper}>
              <MessagesSquare className={styles.icon} strokeWidth={1.8} />
            </div>
            <div className={styles.cardContent}>
              <h2>I&apos;m triggered</h2>
              <p>Pause, name the thinking pattern &amp; find calm words</p>
            </div>
          </div>
        </button>

        {/* Task Chunker */}
        <button 
          type="button"
          className={`${styles.intentCard} ${styles.cardOverwhelm}`}
          onClick={() => router.push('/overwhelmed')}
          aria-label="Task Chunker (Energy-Adaptive)"
        >
          <div className={styles.cardHeaderRow}>
            <span className={styles.featureBadgeSage}>
              <Zap size={11} strokeWidth={2.5} /> Energy-Adaptive
            </span>
          </div>
          <div className={styles.cardMainRow}>
            <div className={styles.iconWrapper}>
              <ListTree className={styles.icon} strokeWidth={1.8} />
            </div>
            <div className={styles.cardContent}>
              <h2>I&apos;m overwhelmed</h2>
              <p>Zero-friction micro-actions tailored for ADHD executive function</p>
            </div>
          </div>
        </button>

        {/* Voice Journal */}
        <button 
          type="button"
          className={`${styles.intentCard} ${styles.cardVent}`}
          onClick={() => router.push('/vent')}
          aria-label="Voice Journal (Reflective Listening)"
        >
          <div className={styles.cardHeaderRow}>
            <span className={styles.featureBadgeBlush}>
              <Mic size={11} strokeWidth={2.5} /> Reflective Listening
            </span>
          </div>
          <div className={styles.cardMainRow}>
            <div className={styles.iconWrapper}>
              <AudioLines className={styles.icon} strokeWidth={1.8} />
            </div>
            <div className={styles.cardContent}>
              <h2>I need to vent</h2>
              <p>Speak freely into a judgment-free reflective audio space</p>
            </div>
          </div>
        </button>
      </div>
    </main>
  );
}
