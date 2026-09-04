"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTempo } from "@/lib/TempoContext";
import BrandHeader from "@/components/BrandHeader";
import OnboardingModal from "@/components/OnboardingModal";
import { 
  ChevronLeft, 
  Sliders, 
  Sun, 
  Moon, 
  Monitor, 
  Type, 
  Activity, 
  Volume2, 
  User, 
  Compass 
} from "lucide-react";
import styles from "./page.module.css";

export default function Settings() {
  const router = useRouter();
  const [showTour, setShowTour] = useState(false);
  const { 
    theme, 
    setTheme, 
    motion, 
    setMotion, 
    sound, 
    setSound, 
    textSize, 
    setTextSize,
    userName,
    setUserName 
  } = useTempo();

  return (
    <main className={`page-container ${styles.container}`}>
      <BrandHeader />
      
      <div className={styles.topBar}>
        <button 
          type="button"
          className={styles.backButton} 
          onClick={() => router.push("/")}
          aria-label="Back to home"
        >
          <ChevronLeft size={16} />
          <span>Home</span>
        </button>
        <span className={styles.protocolBadge}>
          <Sliders size={12} strokeWidth={2.2} /> Preferences
        </span>
      </div>

      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Sensory &amp; Focus Preferences</h1>
        <p className={styles.pageSubtitle}>
          Tailor Tempo to your nervous system, visual comfort, and sensory needs.
        </p>
      </header>

      <section className={styles.settingsForm}>
        {/* 1. Visual Theme */}
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingTitle}>Contrast &amp; Palette</span>
            <span className={styles.settingDesc}>Select warm paper ivory or low-stim dark theme</span>
          </div>
          <div className={styles.segmentedControl}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${theme === "system" ? styles.segmentActive : ""}`}
              onClick={() => setTheme("system")}
            >
              <Monitor size={13} />
              <span>System</span>
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${theme === "light" ? styles.segmentActive : ""}`}
              onClick={() => setTheme("light")}
            >
              <Sun size={13} />
              <span>Warm Light</span>
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${theme === "dark" ? styles.segmentActive : ""}`}
              onClick={() => setTheme("dark")}
            >
              <Moon size={13} />
              <span>Dark Theme</span>
            </button>
          </div>
        </div>

        {/* 2. Text Scaling */}
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingTitle}>Typography Sizing</span>
            <span className={styles.settingDesc}>Enlarge font scale for effortless scanning</span>
          </div>
          <div className={styles.segmentedControl}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${textSize === 0 ? styles.segmentActive : ""}`}
              onClick={() => setTextSize(0)}
            >
              <Type size={13} />
              <span>Default</span>
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${textSize === 1 ? styles.segmentActive : ""}`}
              onClick={() => setTextSize(1)}
            >
              <span>Comfort (110%)</span>
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${textSize === 2 ? styles.segmentActive : ""}`}
              onClick={() => setTextSize(2)}
            >
              <span>Large (120%)</span>
            </button>
          </div>
        </div>

        {/* 3. Motion Settings */}
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingTitle}>Motion &amp; Animations</span>
            <span className={styles.settingDesc}>Disable animations if you experience vestibular sensitivity</span>
          </div>
          <div className={styles.segmentedControl}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${motion === "full" ? styles.segmentActive : ""}`}
              onClick={() => setMotion("full")}
            >
              <Activity size={13} />
              <span>Full Motion</span>
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${motion === "reduced" ? styles.segmentActive : ""}`}
              onClick={() => setMotion("reduced")}
            >
              <span>Reduced Motion</span>
            </button>
          </div>
        </div>

        {/* 4. Auditory Feedback */}
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingTitle}>Auditory Chimes</span>
            <span className={styles.settingDesc}>Play gentle harmonic tones on step completion</span>
          </div>
          <div className={styles.segmentedControl}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${sound ? styles.segmentActive : ""}`}
              onClick={() => setSound(true)}
            >
              <Volume2 size={13} />
              <span>Enabled</span>
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${!sound ? styles.segmentActive : ""}`}
              onClick={() => setSound(false)}
            >
              <span>Muted</span>
            </button>
          </div>
        </div>

        {/* 5. User Name */}
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingTitle}>Preferred Name</span>
            <span className={styles.settingDesc}>Display name on the welcoming screen</span>
          </div>
          <div className={styles.nameInputWrapper}>
            <User size={14} className={styles.inputIcon} />
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Alex"
              className={styles.nameInput}
              maxLength={24}
            />
          </div>
        </div>

        {/* 6. Onboarding Tour */}
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingTitle}>Product Walkthrough</span>
            <span className={styles.settingDesc}>Review the step-by-step walkthrough of Tempo&apos;s tools</span>
          </div>
          <button
            type="button"
            className={styles.tourBtn}
            onClick={() => setShowTour(true)}
          >
            <Compass size={14} />
            <span>Replay Walkthrough</span>
          </button>
        </div>
      </section>

      <OnboardingModal 
        isOpen={showTour} 
        onClose={() => setShowTour(false)} 
      />
    </main>
  );
}
