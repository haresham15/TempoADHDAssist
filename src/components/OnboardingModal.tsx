"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  MessagesSquare, 
  ListTree, 
  Mic, 
  Lock,
  CheckCircle2,
  Sparkles
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
}

const STEPS: StepContent[] = [
  {
    category: "Welcome",
    title: "A quiet pause before you react",
    description:
      "Tempo is an emotional circuit breaker designed for ADHD, Rejection Sensitive Dysphoria (RSD), and executive freeze. It provides a calm space to regulate your nervous system before responding.",
    highlight:
      "Zero destination: Tempo has no integrations with messaging or email. You can never accidentally dispatch a message.",
    icon: ShieldCheck,
  },
  {
    category: "Communication Buffer",
    title: "Turn triggers into calm words",
    description:
      "Ambiguous emails or blunt texts can trigger an immediate autonomic panic. Paste what was said into the Buffer to find clarity.",
    highlight:
      "Tempo validates what you feel, identifies the cognitive distortion, and generates a grounded, de-escalated response.",
    icon: MessagesSquare,
  },
  {
    category: "Task Chunker & Visual Bypass",
    title: "Defeat physical & mental freeze",
    description:
      "When a project or messy space feels insurmountable, Tempo breaks it down into 3 to 5 atomic, low-friction micro-actions.",
    highlight:
      "Upload a photo of clutter to spotlight exactly one physical item at a time, eliminating verbal formulation paralysis entirely.",
    icon: ListTree,
  },
  {
    category: "Sensory Vent & Audio",
    title: "Release thoughts & ground your senses",
    description:
      "Speak or write freely in the Sensory Vent space. Activate client-side sound anchors like Brown Noise or a 65 BPM grounding pulse to soothe racing thoughts.",
    highlight:
      "Non-directive mirroring provides quiet validation without patronizing advice or overwhelming instructions.",
    icon: Mic,
  },
  {
    category: "Privacy & Sovereignty",
    title: "Private, ephemeral, and safe",
    description:
      "Your raw thoughts are never stored by default. Sessions remain local and ephemeral unless you explicitly choose to save them.",
    highlight:
      "A deterministic safety layer immediately routes crisis language to 988 and 741741 lifelines.",
    icon: Lock,
  },
];

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    // Reset step when opening
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
      aria-label="Tempo Onboarding Tour"
    >
      <div className={styles.modal}>
        <button 
          type="button" 
          className={styles.closeButton} 
          onClick={handleDismiss}
          aria-label="Close walkthrough"
        >
          <X size={18} />
        </button>

        <div className={styles.headerRow}>
          <div className={styles.iconBadge}>
            <StepIcon size={22} strokeWidth={2} />
          </div>
          <div>
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
          {/* Progress Dots */}
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
            <div className={styles.leftControls}>
              <button
                type="button"
                className={styles.textBtn}
                onClick={handleDismiss}
              >
                Skip Tour
              </button>
            </div>

            <div className={styles.rightControls}>
              {currentStep > 0 && (
                <button
                  type="button"
                  className={styles.navBtn}
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
