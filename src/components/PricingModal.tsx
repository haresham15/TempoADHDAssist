"use client";

import { useState } from "react";
import { X, Check, Sparkles } from "lucide-react";
import styles from "./PricingModal.module.css";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [isPlusPreview, setIsPlusPreview] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tempo_plus_active") === "true";
    }
    return false;
  });

  const togglePreview = () => {
    const next = !isPlusPreview;
    setIsPlusPreview(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("tempo_plus_active", String(next));
      window.dispatchEvent(new Event("tempo_plus_change"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h2>Transparent, ADHD-Friendly Pricing</h2>
            <p>
              Tempo is built on trust. No dark patterns, no cancellation guilt, and no locking crisis safety behind a paywall.
            </p>
          </div>
          <button 
            type="button" 
            className={styles.closeBtn} 
            onClick={onClose}
            aria-label="Close pricing details"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.cardsGrid}>
          {/* Free Tier */}
          <div className={styles.tierCard}>
            <div className={styles.cardTop}>
              <span className={styles.badge}>Always Free</span>
              <h3 className={styles.tierName}>Tempo Core</h3>
              <div className={styles.tierPrice}>$0 <span>/ forever</span></div>
            </div>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <Check size={16} className={styles.checkIcon} />
                <span>Unlimited ephemeral RSD message reframing</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={16} className={styles.checkIcon} />
                <span>Deterministic crisis safety net (988 integration)</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={16} className={styles.checkIcon} />
                <span>Zero-friction anonymous usage without an account</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={16} className={styles.checkIcon} />
                <span>&ldquo;Try it yourself first&rdquo; practice mode</span>
              </li>
            </ul>
          </div>

          {/* Plus Tier */}
          <div className={`${styles.tierCard} ${styles.plusCard}`}>
            <div className={styles.cardTop}>
              <span className={styles.badge}>
                <Sparkles size={11} style={{ display: "inline", marginRight: "3px" }} />
                Skill Builder
              </span>
              <h3 className={styles.tierName}>Tempo Plus</h3>
              <div className={styles.tierPrice}>$4.99 <span>/ month ($39/yr)</span></div>
            </div>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <Check size={16} className={styles.checkIcon} />
                <span><strong>Pattern Insights</strong>: Aggregate recurrence trends</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={16} className={styles.checkIcon} />
                <span>Unlimited encrypted cloud session history</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={16} className={styles.checkIcon} />
                <span>Reflective Voice Journal (Gemini audio)</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={16} className={styles.checkIcon} />
                <span>Energy-adaptive Task Chunker</span>
              </li>
            </ul>

            <div className={styles.previewToggleArea}>
              <button 
                type="button" 
                className={`${styles.previewBtn} ${isPlusPreview ? styles.activePreviewBtn : ""}`}
                onClick={togglePreview}
              >
                {isPlusPreview ? (
                  <>
                    <Check size={15} />
                    <span>Tempo Plus Preview Active</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Enable Tempo Plus Preview</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <p className={styles.footerNote}>
          Modeled respectfully on Inflow &amp; Tiimo. We never sell data or run ads.
        </p>
      </div>
    </div>
  );
}
