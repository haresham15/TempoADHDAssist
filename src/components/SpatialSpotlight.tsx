"use client";

import React, { useState } from "react";
import { Check, SkipForward, RefreshCw, Sparkles } from "lucide-react";
import styles from "./SpatialSpotlight.module.css";
import { SpatialItem } from "@/app/api/chunk-spatial/route";

interface SpatialSpotlightProps {
  imageUrl: string;
  items: SpatialItem[];
  spaceDescription?: string;
  onReset?: () => void;
}

export default function SpatialSpotlight({
  imageUrl,
  items,
  onReset,
}: SpatialSpotlightProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentItem = items[currentIndex];

  const playStepChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // Ignore
    }
  };

  const handleDone = () => {
    playStepChime();
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleSkip = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (isCompleted) {
    return (
      <div className={styles.container}>
        <div className={styles.completionPanel}>
          <div className={styles.completionIcon}>
            <Sparkles size={28} />
          </div>
          <h3 className={styles.completionTitle}>Physical space cleared!</h3>
          <p className={styles.completionSubtitle}>
            You completed {items.length} spatial micro-steps without formulating a single word of executive overwhelm.
          </p>
          {onReset && (
            <button type="button" onClick={onReset} className={styles.actionBtn}>
              <RefreshCw size={14} />
              <span>Spotlight another space</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Calculate box coordinates from 0-1000 scale
  const [ymin, xmin, ymax, xmax] = currentItem.box_2d || [200, 200, 600, 600];
  const top = `${(ymin / 1000) * 100}%`;
  const left = `${(xmin / 1000) * 100}%`;
  const height = `${((ymax - ymin) / 1000) * 100}%`;
  const width = `${((xmax - xmin) / 1000) * 100}%`;

  return (
    <div className={styles.container}>
      <div className={styles.imageViewport} aria-label="Interactive spatial clutter spotlight">
        {/* Base Uploaded Photograph */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Cluttered environment" className={styles.baseImage} />

        {/* The Spotlight Box isolating only ONE item */}
        <div
          className={styles.spotlightBox}
          style={{
            top,
            left,
            height,
            width,
          }}
        >
          <div className={styles.spotlightBeacon}>
            {currentIndex + 1}
          </div>
        </div>
      </div>

      {/* Focused Action Card for ONLY this single item */}
      <div className={styles.actionCard} role="region" aria-live="polite">
        <div className={styles.metaRow}>
          <span className={styles.stepBadge}>
            Item {currentIndex + 1} of {items.length} &bull; {currentItem.category}
          </span>
          <span className={styles.timeEstimate}>{currentItem.estTime}</span>
        </div>

        <h3 className={styles.stepTitle}>{currentItem.title}</h3>

        <div className={styles.buttonRow}>
          <button type="button" onClick={handleDone} className={styles.doneButton}>
            <Check size={16} />
            <span>Mark Done</span>
          </button>
          <button type="button" onClick={handleSkip} className={styles.skipButton}>
            <SkipForward size={14} />
            <span>Skip Item</span>
          </button>
        </div>
      </div>
    </div>
  );
}
