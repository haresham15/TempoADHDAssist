"use client";

import React, { useState, useEffect } from "react";
import { getAuditoryAnchor, AnchorMode } from "@/lib/audioAnchor";
import styles from "./AudioAnchorControl.module.css";

interface AudioAnchorControlProps {
  className?: string;
  style?: React.CSSProperties;
  defaultMode?: AnchorMode;
}

export default function AudioAnchorControl({ className = "", style, defaultMode = "off" }: AudioAnchorControlProps) {
  const [currentMode, setCurrentMode] = useState<AnchorMode>(defaultMode);

  useEffect(() => {
    // Keep internal state aligned with engine
    const engine = getAuditoryAnchor();
    setCurrentMode(engine.getMode());

    return () => {
      // Ensure audio stops if user navigates away completely
      // Only stop if this is the only active controller
    };
  }, []);

  const handleSelectMode = (mode: AnchorMode) => {
    const engine = getAuditoryAnchor();
    if (currentMode === mode) {
      engine.setMode("off");
      setCurrentMode("off");
    } else {
      engine.setMode(mode);
      setCurrentMode(mode);
    }
  };

  return (
    <div className={`${styles.anchorContainer} ${className}`} style={style} role="region" aria-label="Auditory Anchor Soundscape">
      <div className={styles.label}>
        <span className={`${styles.activeIndicator} ${currentMode !== "off" ? styles.on : ""}`} aria-hidden="true" />
        <span>Sound Anchor</span>
      </div>
      <div className={styles.modeButtons}>
        <button
          type="button"
          onClick={() => handleSelectMode("brown")}
          className={`${styles.modeBtn} ${currentMode === "brown" ? styles.active : ""}`}
          title="Gentle low-frequency brown noise to block auditory overstimulation"
          aria-pressed={currentMode === "brown"}
        >
          🌿 Brown Noise
        </button>
        <button
          type="button"
          onClick={() => handleSelectMode("pulse")}
          className={`${styles.modeBtn} ${currentMode === "pulse" ? styles.active : ""}`}
          title="Subtle 65 BPM pulse to ground heart rate and stabilize pacing"
          aria-pressed={currentMode === "pulse"}
        >
          🥁 65 BPM Pulse
        </button>
        <button
          type="button"
          onClick={() => handleSelectMode("drone")}
          className={`${styles.modeBtn} ${currentMode === "drone" ? styles.active : ""}`}
          title="432Hz harmonic warm drone for sensory grounding"
          aria-pressed={currentMode === "drone"}
        >
          🎵 432Hz Drone
        </button>
      </div>
    </div>
  );
}
