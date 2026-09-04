"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTempo } from "@/lib/TempoContext";
import { ArrowLeft, Check, HeartHandshake, Zap, Bookmark, Camera, Type, RefreshCw } from "lucide-react";
import SpatialSpotlight from "@/components/SpatialSpotlight";
import { SpatialItem } from "@/app/api/chunk-spatial/route";
import AudioAnchorControl from "@/components/AudioAnchorControl";
import BodyDoublingSyndicate from "@/components/BodyDoublingSyndicate";
import styles from "./page.module.css";

export default function Overwhelmed() {
  const router = useRouter();
  const { ventContext, sound } = useTempo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // V4 Mode Switch & Spatial State
  const [inputMode, setInputMode] = useState<"text" | "spatial">("text");
  const [spatialImage, setSpatialImage] = useState<string | null>(null);
  const [spatialItems, setSpatialItems] = useState<SpatialItem[]>([]);
  const [spatialLoading, setSpatialLoading] = useState(false);
  const [spatialError, setSpatialError] = useState("");

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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSpatialLoading(true);
    setSpatialError("");

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setSpatialImage(base64Data);

      try {
        const res = await fetch("/api/chunk-spatial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64Data,
            mimeType: file.type || "image/jpeg",
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to analyze spatial clutter.");
        }

        setSpatialItems(data.items || []);
      } catch (err: unknown) {
        setSpatialError(err instanceof Error ? err.message : "Could not analyze image.");
      } finally {
        setSpatialLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetSpatial = () => {
    setSpatialImage(null);
    setSpatialItems([]);
    setSpatialError("");
    setSpatialLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      ) : spatialImage && spatialItems.length > 0 ? (
        /* V4 Spatial Spotlight View */
        <section className={styles.stepsContainer}>
          <div className={styles.anchorsRow}>
            <AudioAnchorControl />
            <BodyDoublingSyndicate />
          </div>
          <SpatialSpotlight
            imageUrl={spatialImage}
            items={spatialItems}
            onReset={handleResetSpatial}
          />
        </section>
      ) : steps.length === 0 ? (
        /* 2. Task Input / Spatial Upload View */
        <section className={styles.inputSection}>
          <div className={styles.introHeading}>
            <h1>Task Chunker</h1>
            <p>Break any daunting task into small, manageable micro-steps.</p>
          </div>

          <div className={styles.modeSwitch} role="tablist">
            <button
              type="button"
              className={`${styles.modeSwitchBtn} ${inputMode === "text" ? styles.activeMode : ""}`}
              onClick={() => setInputMode("text")}
              role="tab"
              aria-selected={inputMode === "text"}
            >
              Type Task
            </button>
            <button
              type="button"
              className={`${styles.modeSwitchBtn} ${inputMode === "spatial" ? styles.activeMode : ""}`}
              onClick={() => setInputMode("spatial")}
              role="tab"
              aria-selected={inputMode === "spatial"}
            >
              Photo Cleanup
            </button>
          </div>

          {inputMode === "text" ? (
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
          ) : (
            <div className={styles.inputWrapper}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className={styles.fileInputHidden}
                id="spatial-photo-input"
                disabled={spatialLoading}
              />
              <label htmlFor="spatial-photo-input" className={styles.photoUploadZone}>
                <Camera size={32} className={styles.photoIconSvg} />
                <p className={styles.photoUploadPrompt}>
                  {spatialLoading ? "Analyzing space..." : "Take or upload a photo of the mess"}
                </p>
                <p className={styles.photoUploadSub}>
                  No typing required. Tempo will visually spotlight one item at a time.
                </p>
              </label>
            </div>
          )}

          {error && <div className={styles.error} role="alert">{error}</div>}
          {spatialError && <div className={styles.error} role="alert">{spatialError}</div>}
        </section>
      ) : !allCompleted ? (
        /* 3. Steps View */
        <section className={styles.stepsContainer}>
          <div className={styles.anchorsRow}>
            <AudioAnchorControl />
            <BodyDoublingSyndicate />
          </div>
          <div className={styles.stepsHeader}>
            <div className={styles.stepsHeaderLeft}>
              <button
                type="button"
                className={`${styles.modeToggleBtn} ${focusMode ? styles.modeActive : ""}`}
                onClick={() => setFocusMode(!focusMode)}
                aria-label={focusMode ? "Switch to all steps list" : "Switch to single step focus mode"}
              >
                {focusMode ? "Show All Steps" : "Focus Mode"}
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
          <h2>That&apos;s the whole thing, done.</h2>
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
