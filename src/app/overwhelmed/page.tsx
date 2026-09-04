"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTempo } from "@/lib/TempoContext";
import { ArrowLeft, Check, HeartHandshake, Zap, Bookmark } from "lucide-react";
import styles from "./page.module.css";


export default function Overwhelmed() {
  const router = useRouter();
  const { ventContext, sound } = useTempo();
  const [task, setTask] = useState(ventContext || "");
  const [steps, setSteps] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState("Low");
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [focusMode, setFocusMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCrisis, setIsCrisis] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const playCalmTone = () => {
    if (!sound) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio context disabled or blocked
    }
  };

  const handleChunkTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    setLoading(true);
    setError("");
    setSteps([]);
    setIsCrisis(false);
    setCompletedSteps(new Set());
    setSaved(false);

    try {
      const response = await fetch("/api/chunk-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: task.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to break down task.");
      }

      if (data.isCrisis) {
        setIsCrisis(true);
        return;
      }

      setSteps(data.steps || []);
      if (data.energyLevel) setEnergyLevel(data.energyLevel);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
        playCalmTone();
      }
      return next;
    });
  };

  const handleSaveTask = async () => {
    if (saved || saving || steps.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/chunk-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          save: true,
          task,
          steps,
        }),
      });
      if (res.ok) {
        setSaved(true);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setIsCrisis(false);
    setSteps([]);
    setTask("");
    setCompletedSteps(new Set());
    setError("");
    setSaved(false);
    setFocusMode(false);
  };

  const allCompleted = steps.length > 0 && completedSteps.size === steps.length;
  const progressPercent = steps.length > 0 ? Math.round((completedSteps.size / steps.length) * 100) : 0;
  
  // Find first uncompleted step index for focus mode
  const currentStepIndex = steps.findIndex((_, i) => !completedSteps.has(i));

  return (
    <main className={`page-container ${styles.container}`}>
      <button 
        className={styles.backButton} 
        onClick={() => router.push("/")}
        aria-label="Back to home"
      >
        <ArrowLeft className={styles.backIcon} strokeWidth={2} /> 
      </button>

      {/* 1. Crisis View */}
      {isCrisis ? (
        <section className={styles.crisisSection} aria-live="assertive">
          <div className={styles.crisisCard}>
            <div className={styles.crisisIconWrapper}>
              <HeartHandshake className={styles.crisisIcon} strokeWidth={2} />
            </div>
            <h2 className={styles.crisisTitle}>A pause for something heavier</h2>
            <p className={styles.crisisIntro}>
              It sounds like you may be going through something really heavy right now, and this is more than an executive function task.
            </p>

            <div className={styles.resourceList}>
              <div className={styles.resourceItem}>
                <span className={styles.resourceName}>988 Suicide &amp; Crisis Lifeline</span>
                <span className={styles.resourceDetail}>Call or text <strong>988</strong> (Free, confidential, 24/7)</span>
              </div>
              <div className={styles.resourceItem}>
                <span className={styles.resourceName}>Crisis Text Line</span>
                <span className={styles.resourceDetail}>Text <strong>HOME</strong> to <strong>741741</strong> to reach a counselor</span>
              </div>
            </div>

            <div className={styles.crisisActions}>
              <button className={styles.outlineBtn} onClick={handleReset}>
                Go back
              </button>
            </div>
          </div>
        </section>
      ) : steps.length === 0 ? (
        /* 2. Task Input View */
        <section className={styles.inputSection}>
          <div className={styles.introHeading}>
            <h1>Task Chunker</h1>
            <p>Break any daunting task into small, manageable micro-steps.</p>
          </div>

          <form onSubmit={handleChunkTask} className={styles.inputWrapper}>
            <input
              type="text"
              className={styles.input}
              placeholder="What task is overwhelming you right now?"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              disabled={loading}
              autoFocus
              aria-label="Task to break down"
            />
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={loading || !task.trim()}
            >
              {loading ? <span className={styles.pulseText}>Breaking it down...</span> : "Break it down"}
            </button>
          </form>

          {error && <div className={styles.error} role="alert">{error}</div>}
        </section>
      ) : !allCompleted ? (
        /* 3. Steps View */
        <section className={styles.stepsContainer}>
          <div className={styles.stepsHeader}>
            <div className={styles.stepsHeaderLeft}>
              <span className={styles.energyBadge}>
                <Zap size={13} /> {energyLevel} Energy
              </span>
              <button
                type="button"
                className={`${styles.modeToggleBtn} ${focusMode ? styles.modeActive : ""}`}
                onClick={() => setFocusMode(!focusMode)}
                aria-label={focusMode ? "Switch to all steps list" : "Switch to single step focus mode"}
              >
                {focusMode ? "Show All Steps" : "🎯 One Step at a Time"}
              </button>
            </div>
            <span className={styles.stepProgress}>
              {completedSteps.size} of {steps.length} done ({progressPercent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className={styles.progressBarTrack} role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
          </div>

          {focusMode && currentStepIndex !== -1 ? (
            /* Single-Step Focus Mode Spotlight */
            <div className={styles.focusSpotlightCard}>
              <div className={styles.focusStepBadge}>
                <span>Step {currentStepIndex + 1} of {steps.length}</span>
                {currentStepIndex === 0 && <span className={styles.gatewayPill}>Gateway Step</span>}
              </div>
              <h3 className={styles.focusStepTitle}>{steps[currentStepIndex]}</h3>
              <p className={styles.focusStepHint}>Don&apos;t think about the rest. Just take this single micro-action.</p>
              <button
                type="button"
                className={styles.focusCompleteBtn}
                onClick={() => toggleStep(currentStepIndex)}
              >
                <Check size={18} strokeWidth={2.5} />
                <span>Done! Next micro-step</span>
              </button>
            </div>
          ) : (
            /* All Steps List */
            steps.map((step: string, index: number) => {
              const isCompleted = completedSteps.has(index);
              return (
                <div 
                  key={index} 
                  className={`${styles.stepCard} ${isCompleted ? styles.completedCard : ""}`}
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <button 
                    type="button"
                    className={`${styles.checkbox} ${isCompleted ? styles.checked : ""}`}
                    onClick={() => toggleStep(index)}
                    aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                  >
                    {isCompleted && <Check strokeWidth={3} className={styles.checkIcon} />}
                  </button>
                  <div className={styles.stepText}>
                    {index === 0 && <span className={styles.gatewayLabel}>Gateway Step: </span>}
                    {step}
                  </div>
                </div>
              );
            })
          )}

          <div className={styles.taskActions}>
            <button 
              type="button"
              className={`${styles.saveBtn} ${saved ? styles.savedBtn : ""}`}
              onClick={handleSaveTask}
              disabled={saving || saved}
            >
              {saved ? (
                <>
                  <Check size={16} />
                  <span>Saved to History</span>
                </>
              ) : (
                <>
                  <Bookmark size={16} />
                  <span>{saving ? "Saving..." : "Save privately"}</span>
                </>
              )}
            </button>

            <button 
              type="button" 
              className={styles.outlineBtn} 
              onClick={handleReset}
            >
              Start over
            </button>
          </div>
        </section>
      ) : (
        /* 4. Completion View */
        <section className={styles.successContainer}>
          <h2>That&apos;s the whole thing, done! 🎉</h2>
          <p className={styles.successSub}>You cut through the paralysis and finished every single micro-action.</p>
          <button 
            type="button"
            className={styles.outlineBtn} 
            onClick={handleReset}
          >
            Break down something else
          </button>
        </section>
      )}
    </main>
  );
}
