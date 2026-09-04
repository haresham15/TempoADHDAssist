"use client";

import { useRouter } from "next/navigation";
import { useTempo } from "@/lib/TempoContext";
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Monitor, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Eye, 
  Check,
  User
} from "lucide-react";
import BrandHeader from "@/components/BrandHeader";
import styles from "./page.module.css";

export default function Settings() {
  const router = useRouter();
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
      
      <div className={styles.backWrapper}>
        <button 
          className={styles.backButton} 
          onClick={() => router.push("/")}
          aria-label="Back to home"
        >
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </button>
      </div>

      <section className={styles.settingsCard}>
        <div className={styles.headerArea}>
          <div className={styles.iconCircle}>
            <Sparkles size={24} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.settingsTitle}>Sensory &amp; Focus Settings</h1>
            <p className={styles.settingsSubtitle}>Tailor Tempo to your nervous system and executive preferences.</p>
          </div>
        </div>

        {/* 1. Visual Theme (Glare & Light Control) */}
        <div className={styles.settingGroup}>
          <div className={styles.settingHeader}>
            <span className={styles.settingLabel}>Visual Atmosphere</span>
            <span className={styles.settingHint}>Adjust contrast and glare</span>
          </div>
          <div className={styles.segmentedControl}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${theme === "system" ? styles.segmentActive : ""}`}
              onClick={() => setTheme("system")}
            >
              <Monitor size={15} />
              <span>System</span>
              {theme === "system" && <Check size={13} className={styles.checkMarker} />}
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${theme === "dark" ? styles.segmentActive : ""}`}
              onClick={() => setTheme("dark")}
            >
              <Moon size={15} />
              <span>Low-Stim Night</span>
              {theme === "dark" && <Check size={13} className={styles.checkMarker} />}
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${theme === "light" ? styles.segmentActive : ""}`}
              onClick={() => setTheme("light")}
            >
              <Sun size={15} />
              <span>Warm Linen</span>
              {theme === "light" && <Check size={13} className={styles.checkMarker} />}
            </button>
          </div>
        </div>

        {/* 2. Text Scaling & Readability */}
        <div className={styles.settingGroup}>
          <div className={styles.settingHeader}>
            <span className={styles.settingLabel}>Typography Scale</span>
            <span className={styles.settingHint}>Enhance scanning &amp; legibility</span>
          </div>
          <div className={styles.segmentedControl}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${textSize === 0 ? styles.segmentActive : ""}`}
              onClick={() => setTextSize(0)}
            >
              <span>Default (100%)</span>
              {textSize === 0 && <Check size={13} className={styles.checkMarker} />}
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${textSize === 1 ? styles.segmentActive : ""}`}
              onClick={() => setTextSize(1)}
            >
              <span>Comfortable (+15%)</span>
              {textSize === 1 && <Check size={13} className={styles.checkMarker} />}
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${textSize === 2 ? styles.segmentActive : ""}`}
              onClick={() => setTextSize(2)}
            >
              <span>Spacious (+30%)</span>
              {textSize === 2 && <Check size={13} className={styles.checkMarker} />}
            </button>
          </div>
        </div>

        {/* 3. Motion Sensitivity */}
        <div className={styles.settingGroup}>
          <div className={styles.settingHeader}>
            <span className={styles.settingLabel}>Motion &amp; Transitions</span>
            <span className={styles.settingHint}>Reduce background stimulation</span>
          </div>
          <div className={styles.segmentedControl}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${motion === "full" ? styles.segmentActive : ""}`}
              onClick={() => setMotion("full")}
            >
              <Eye size={15} />
              <span>Fluid Motion</span>
              {motion === "full" && <Check size={13} className={styles.checkMarker} />}
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${motion === "reduced" ? styles.segmentActive : ""}`}
              onClick={() => setMotion("reduced")}
            >
              <span>Still &amp; Calm</span>
              {motion === "reduced" && <Check size={13} className={styles.checkMarker} />}
            </button>
          </div>
        </div>

        {/* 4. Auditory Feedback */}
        <div className={styles.settingGroup}>
          <div className={styles.settingHeader}>
            <span className={styles.settingLabel}>Micro-Action Audio</span>
            <span className={styles.settingHint}>Soft chime on step completion</span>
          </div>
          <div className={styles.segmentedControl}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${sound ? styles.segmentActive : ""}`}
              onClick={() => setSound(true)}
            >
              <Volume2 size={15} />
              <span>Chimes On</span>
              {sound && <Check size={13} className={styles.checkMarker} />}
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} {!sound ? styles.segmentActive : ""}`}
              onClick={() => setSound(false)}
            >
              <VolumeX size={15} />
              <span>Silent Mode</span>
              {!sound && <Check size={13} className={styles.checkMarker} />}
            </button>
          </div>
        </div>

        {/* 5. Personal Greeting */}
        <div className={styles.settingGroup}>
          <div className={styles.settingHeader}>
            <span className={styles.settingLabel}>Preferred Name</span>
            <span className={styles.settingHint}>What should Tempo call you?</span>
          </div>
          <div className={styles.nameInputWrapper}>
            <User size={16} className={styles.nameIcon} />
            <input
              type="text"
              className={styles.nameInput}
              placeholder="Your name or nickname..."
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              maxLength={30}
              aria-label="Your preferred name"
            />
          </div>
        </div>

        <div className={styles.privacyNote}>
          🔒 Your preferences are preserved locally and synced to your encrypted private profile.
        </div>
      </section>
    </main>
  );
}

