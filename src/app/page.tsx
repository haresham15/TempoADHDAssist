"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTempo } from "@/lib/TempoContext";
import { 
  MessagesSquare, 
  ListTree, 
  AudioLines, 
  Sparkles, 
  Zap, 
  Mic, 
  Clock, 
  ChevronRight,
  Wind
} from "lucide-react";
import BrandHeader from "@/components/BrandHeader";
import OnboardingModal from "@/components/OnboardingModal";
import styles from "./page.module.css";

export default function Home() {
  const { userName } = useTempo();
  const router = useRouter();
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Pause">("Inhale");
  const [seconds, setSeconds] = useState(4);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("tempo_onboarding_dismissed");
      if (dismissed !== "true") {
        setShowOnboarding(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!breathingActive) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev > 1) return prev - 1;

        setBreathPhase((currentPhase) => {
          if (currentPhase === "Inhale") return "Hold";
          if (currentPhase === "Hold") return "Exhale";
          if (currentPhase === "Exhale") return "Pause";
          return "Inhale";
        });
        return 4;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingActive]);

  return (
    <main className={`page-container ${styles.container}`}>
      <BrandHeader />
      
      <header className={styles.header}>
        <h1 className={styles.greeting}>
          {userName ? `Hi ${userName}` : "Take a breath"}
        </h1>
        <p className={styles.subtitle}>A quiet space before you react.</p>

        {/* Quick Grounding Breath Prompt */}
        <div className={styles.breathBarWrapper}>
          {!breathingActive ? (
            <button
              type="button"
              className={styles.startBreathBtn}
              onClick={() => {
                setBreathingActive(true);
                setBreathPhase("Inhale");
                setSeconds(4);
              }}
              aria-label="Start 4-second calming box breathing"
            >
              <Wind size={15} className={styles.windIcon} />
              <span>Feeling reactive? Take a 4-second breath</span>
            </button>
          ) : (
            <div className={styles.activeBreathCard} aria-live="polite">
              <div className={`${styles.breathCircle} ${styles[breathPhase.toLowerCase()]}`} />
              <div className={styles.breathInfo}>
                <span className={styles.breathPhaseText}>{breathPhase}...</span>
                <span className={styles.breathSecondsText}>{seconds}s</span>
              </div>
              <button
                type="button"
                className={styles.stopBreathBtn}
                onClick={() => setBreathingActive(false)}
                aria-label="Close breathing guide"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </header>

      <div className={styles.intentList}>
        {/* Flagship Hero: RSD Communication Buffer */}
        <button 
          type="button"
          className={`${styles.intentCard} ${styles.cardTriggered} ${styles.cardPrimary}`}
          onClick={() => router.push('/triggered')}
          aria-label="I'm triggered - Pause, deconstruct reactive impulses & find calm words. Takes about 30 seconds."
        >
          <div className={styles.cardHeaderRow}>
            <span className={styles.flagshipBadge}>
              <Sparkles size={12} strokeWidth={2.2} /> Communication Buffer
            </span>
            <span className={styles.timeBadge}>
              <Clock size={11} strokeWidth={2} /> ~30 sec
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
            <ChevronRight size={18} className={styles.cardArrow} />
          </div>
        </button>

        {/* Task Chunker & Visual Bypass */}
        <button 
          type="button"
          className={`${styles.intentCard} ${styles.cardOverwhelm}`}
          onClick={() => router.push('/overwhelmed')}
          aria-label="Task Chunker - Break down tasks into zero-friction micro-actions or photograph clutter. Takes about 2 minutes."
        >
          <div className={styles.cardHeaderRow}>
            <span className={styles.featureBadgeSage}>
              <Zap size={11} strokeWidth={2.2} /> Task Chunker
            </span>
            <span className={styles.timeBadge}>
              <Clock size={11} strokeWidth={2} /> ~2 min
            </span>
          </div>
          <div className={styles.cardMainRow}>
            <div className={styles.iconWrapper}>
              <ListTree className={styles.icon} strokeWidth={1.8} />
            </div>
            <div className={styles.cardContent}>
              <h2>I&apos;m overwhelmed</h2>
              <p>Zero-friction micro-actions tailored for executive function</p>
            </div>
            <ChevronRight size={18} className={styles.cardArrow} />
          </div>
        </button>

        {/* Sensory Vent & Vocal Journal */}
        <button 
          type="button"
          className={`${styles.intentCard} ${styles.cardVent}`}
          onClick={() => router.push('/vent')}
          aria-label="Sensory Vent - Speak freely into a judgment-free reflective audio space. Takes about 60 seconds."
        >
          <div className={styles.cardHeaderRow}>
            <span className={styles.featureBadgeBlush}>
              <Mic size={11} strokeWidth={2.2} /> Sensory Vent
            </span>
            <span className={styles.timeBadge}>
              <Clock size={11} strokeWidth={2} /> ~60 sec
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
            <ChevronRight size={18} className={styles.cardArrow} />
          </div>
        </button>
      </div>

      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
    </main>
  );
}
