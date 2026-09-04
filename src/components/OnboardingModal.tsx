"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  MessagesSquare, 
  ListTree, 
  Mic, 
  Lock,
  CheckCircle2
} from "lucide-react";
import styles from "./OnboardingModal.module.css";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StepContent {
  category: string;
  title: string;
  description: string;
  highlight: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  theme: "default" | "lavender" | "sage" | "blush";
}

const STEPS: StepContent[] = [
  {
    category: "Welcome to Tempo",
    title: "A quiet space before you react",
    description:
      "Tempo is an emotional circuit breaker designed for ADHD, Rejection Sensitive Dysphoria (RSD), and executive freeze. It gives you a low-resistance space to regulate before responding.",
    highlight:
      "Zero destination: Tempo has no live connections to email, Slack, or texting. You can never accidentally send a raw message.",
    icon: Sparkles,
    theme: "default",
  },
  {
    category: "Communication Buffer",
    title: "Deconstruct perceived rejection",
    description:
      "Ambiguous emails or blunt texts can trigger an immediate panic. Paste what was said into the Buffer to find perspective and calm words.",
    highlight:
      "Tempo validates what you feel, identifies cognitive distortions (like catastrophizing), and generates grounded, de-escalated options.",
    icon: MessagesSquare,
    theme: "lavender",
  },
  {
    category: "Task Chunker & Visual Bypass",
    title: "Dissolve blank-page paralysis",
    description:
      "When a project or messy room feels overwhelming, Tempo breaks it down into 3 to 5 atomic, low-energy micro-steps.",
    highlight:
      "Visual Spotlight: Snap a photo of clutter to spotlight one single actionable item, eliminating verbal formulation paralysis entirely.",
    icon: ListTree,
    theme: "sage",
  },
  {
    category: "Sensory Vent & Soundscape",
    title: "Unfiltered release with auditory anchors",
    description:
      "Speak or write freely in a private, judgment-free space. Activate client-side sound anchors like Brown Noise or a 65 BPM pulse to soothe racing thoughts.",
    highlight:
      "Non-directive mirroring provides quiet perspective without unsolicited advice or overwhelming instructions.",
    icon: Mic,
    theme: "blush",
  },
  {
    category: "Privacy & Sovereignty",
    title: "Private, ephemeral, and safe",
    description:
      "Your raw words are never stored by default. Sessions remain completely local and ephemeral unless you explicitly choose to save them.",
    highlight:
      "A deterministic safety layer immediately routes crisis distress to 988 and 741741 lifelines.",
    icon: Lock,
    theme: "default",
  },
];

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      } else if (e.key === "ArrowRight") {
        setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    if (dontShowAgain && typeof window !== "undefined") {
      localStorage.setItem("tempo_onboarding_dismissed", "true");
    }
    onClose();
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const step = STEPS[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div 
      className={styles.backdrop} 
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Tempo Walkthrough"
    >
      <div className={`${styles.modal} ${styles[step.theme]}`}>
        <button 
          type="button" 
          className={styles.closeButton} 
          onClick={handleDismiss}
          aria-label="Close walkthrough"
        >
          <X size={18} />
        </button>

        <div className={styles.headerRow}>
          <div className={`${styles.iconBadge} ${styles[step.theme]}`}>
            <StepIcon size={22} strokeWidth={2} />
          </div>
          <div className={styles.titleCol}>
            <span className={styles.stepCategory}>{step.category}</span>
            <h2 className={styles.stepTitle}>{step.title}</h2>
          </div>
        </div>

        <div className={styles.stepBody}>
          <p className={styles.stepDescription}>{step.description}</p>
          <div className={styles.stepHighlight}>
            <CheckCircle2 size={16} className={styles.highlightIcon} />
            <span>{step.highlight}</span>
          </div>
        </div>

        <div className={styles.footerArea}>
          {/* Progress Indicator */}
          <div className={styles.dotsRow}>
            {STEPS.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`${styles.dot} ${currentStep === index ? styles.dotActive : ""}`}
                onClick={() => setCurrentStep(index)}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <div className={styles.buttonsRow}>
            <button
              type="button"
              className={styles.textBtn}
              onClick={handleDismiss}
            >
              Skip Tour
            </button>

            <div className={styles.navActions}>
              {currentStep > 0 && (
                <button
                  type="button"
                  className={styles.outlineBtn}
                  onClick={handleBack}
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleNext}
              >
                {isLastStep ? (
                  <>
                    <span>Get Started</span>
                    <Sparkles size={15} />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Don't show again checkbox */}
          <div className={styles.dismissRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className={styles.checkbox}
              />
              <span>Don&apos;t show this walkthrough automatically again</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
