"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import BrandHeader from "@/components/BrandHeader";
import styles from "./page.module.css";

export default function Settings() {
  const [motion, setMotion] = useState("full");
  const [sound, setSound] = useState(true);
  const [contrast, setContrast] = useState("standard");
  const [textSize, setTextSize] = useState(1); // 0, 1, 2
  const [theme, setTheme] = useState("light");

  return (
    <main className={`page-container ${styles.container}`}>
      <BrandHeader />
      <header className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Personalize your calm space.</p>
      </header>

      <section className={styles.settingsList}>
        
        {/* Motion */}
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <h3>Motion</h3>
            <p>Background drift and transitions</p>
          </div>
          <div className={styles.pillSelector}>
            {["full", "reduced", "none"].map(opt => (
              <button 
                key={opt}
                className={`${styles.pillBtn} ${motion === opt ? styles.activePill : ""}`}
                onClick={() => setMotion(opt)}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Sound Cues */}
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <h3>Sound cues</h3>
            <p>Soft chime on task completion</p>
          </div>
          <label className={styles.toggleSwitch}>
            <input 
              type="checkbox" 
              checked={sound} 
              onChange={() => setSound(!sound)} 
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        {/* Contrast */}
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <h3>Contrast</h3>
            <p>Make text stand out more</p>
          </div>
          <div className={styles.pillSelector}>
            <button 
              className={`${styles.pillBtn} ${contrast === "standard" ? styles.activePill : ""}`}
              onClick={() => setContrast("standard")}
            >
              Standard
            </button>
            <button 
              className={`${styles.pillBtn} ${contrast === "high" ? styles.activePill : ""}`}
              onClick={() => setContrast("high")}
            >
              High Contrast
            </button>
          </div>
        </div>

        {/* Text Size */}
        <div className={styles.settingRowBlock}>
          <div className={styles.settingInfo}>
            <h3>Text size</h3>
            <p style={{ fontSize: textSize === 0 ? '1rem' : textSize === 1 ? '1.1rem' : '1.25rem' }}>
              This is how your text will look.
            </p>
          </div>
          <input 
            type="range" 
            min="0" 
            max="2" 
            step="1" 
            value={textSize}
            onChange={(e) => setTextSize(parseInt(e.target.value))}
            className={styles.rangeSlider}
          />
          <div className={styles.rangeLabels}>
            <span>Comfortable</span>
            <span>Large</span>
            <span>Extra Large</span>
          </div>
        </div>

        {/* Theme */}
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <h3>Theme</h3>
            <p>Switch to Low-Stim Night mode</p>
          </div>
          <div className={styles.themeToggle}>
            <button 
              className={`${styles.themeBtn} ${theme === "light" ? styles.activeTheme : ""}`}
              onClick={() => setTheme("light")}
            >
              <Sun strokeWidth={2} className={styles.themeIcon} />
            </button>
            <button 
              className={`${styles.themeBtn} ${theme === "dark" ? styles.activeTheme : ""}`}
              onClick={() => setTheme("dark")}
            >
              <Moon strokeWidth={2} className={styles.themeIcon} />
            </button>
          </div>
        </div>

      </section>
    </main>
  );
}
