"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTempo } from "@/lib/TempoContext";
import { ArrowLeft, Check, HeartHandshake, Zap, Bookmark } from "lucide-react";
import styles from "./page.module.css";

export default function Overwhelmed() {
  const router = useRouter();
  const { ventContext } = useTempo();
  const [task, setTask] = useState(ventContext || "");
  const [steps, setSteps] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState("Low");
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCrisis, setIsCrisis] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
      // Ephemeral by default: no auto-save
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
  };

  const allCompleted = steps.length > 0 && completedSteps.size === steps.length;

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
            <h1>Low-Friction Task Chunker</h1>
            <p>Break daunting tasks into zero-friction micro-actions tailored for ADHD executive function.</p>
          </div>

          <form onSubmit={handleChunkTask} className={styles.inputWrapper}>
            <input
              type="text"
              className={styles.input}
              placeholder="What's the one thing on your mind?"
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
            <span className={styles.energyBadge}>
              <Zap size={13} /> {energyLevel} Energy Required
            </span>
            <span className={styles.stepProgress}>
              {completedSteps.size} of {steps.length} steps done
            </span>
          </div>

          {steps.map((step: string, index: number) => {
            const isCompleted = completedSteps.has(index);
            return (
              <div 
                key={index} 
                className={`${styles.stepCard} ${isCompleted ? styles.completedCard : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
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
          })}

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
          <h2>That&apos;s the whole thing, done.</h2>
          <p className={styles.successSub}>You cut through the paralysis and finished every step.</p>
          <button 
            type="button"
            className={styles.outlineBtn} 
            onClick={handleReset}
          >
            Start something else
          </button>
        </section>
      )}
    </main>
  );
}
