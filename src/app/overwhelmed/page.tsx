"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTempo } from "@/lib/TempoContext";
import SpatialSpotlight from "@/components/SpatialSpotlight";
import { SpatialItem } from "@/app/api/chunk-spatial/route";
import AudioAnchorControl from "@/components/AudioAnchorControl";
import BodyDoublingSyndicate from "@/components/BodyDoublingSyndicate";
import { 
  ChevronLeft, 
  Zap, 
  Camera, 
  PenTool, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Bookmark, 
  RefreshCw,
  Eye,
  List
} from "lucide-react";
import styles from "./page.module.css";

export default function Overwhelmed() {
  const router = useRouter();
  const { ventContext } = useTempo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // V4 Mode Switch & Spatial State
  const [inputMode, setInputMode] = useState<"text" | "spatial">("text");
  const [spatialImage, setSpatialImage] = useState<string | null>(null);
  const [spatialItems, setSpatialItems] = useState<SpatialItem[]>([]);
  const [spatialLoading, setSpatialLoading] = useState(false);
  const [spatialError, setSpatialError] = useState("");

  const [task, setTask] = useState(ventContext || "");
  const [steps, setSteps] = useState<string[]>([]);
  const [, setEnergyLevel] = useState("Low");
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
        if (err instanceof Error) {
          setSpatialError(err.message || "Failed to analyze spatial clutter.");
        } else {
          setSpatialError("Failed to analyze spatial clutter.");
        }
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
  };

  const playCalmTone = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay restrictions ignored safely
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
      if (data.energyLevel) {
        setEnergyLevel(data.energyLevel);
      }
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
  
  const currentStepIndex = steps.findIndex((_, i) => !completedSteps.has(i));

  return (
    <main className={`page-container ${styles.container}`}>
      <div className={styles.topBar}>
        <button 
          type="button"
          className={styles.backButton} 
          onClick={() => router.push("/")}
          aria-label="Back to home"
        >
          <ChevronLeft size={16} />
          <span>Home</span>
        </button>
        <span className={styles.protocolBadge}>
          <Zap size={12} strokeWidth={2.2} /> Task Chunker
        </span>
      </div>

      {/* 1. Crisis View */}
      {isCrisis ? (
        <section className={styles.crisisSection} aria-live="assertive">
          <div className={styles.crisisCard}>
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
              <button type="button" className={styles.outlineBtn} onClick={handleReset}>
                Return to Tasks
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
          <header className={styles.header}>
            <h1 className={styles.pageTitle}>Decompose your task</h1>
            <p className={styles.pageSubtitle}>
              Break daunting tasks into small micro-steps to dissolve initiation paralysis.
            </p>
          </header>

          <div className={styles.modeSwitch} role="tablist">
            <button
              type="button"
              className={`${styles.modeSwitchBtn} ${inputMode === "text" ? styles.activeMode : ""}`}
              onClick={() => setInputMode("text")}
              role="tab"
              aria-selected={inputMode === "text"}
            >
              <PenTool size={14} />
              <span>Type Task</span>
            </button>
            <button
              type="button"
              className={`${styles.modeSwitchBtn} ${inputMode === "spatial" ? styles.activeMode : ""}`}
              onClick={() => setInputMode("spatial")}
              role="tab"
              aria-selected={inputMode === "spatial"}
            >
              <Camera size={14} />
              <span>Visual Bypass (Photo Clutter)</span>
            </button>
          </div>

          {inputMode === "text" ? (
            <form onSubmit={handleChunkTask} className={styles.inputForm}>
              <div className={styles.deskInputPanel}>
                <div className={styles.deskHeader}>
                  <span className={styles.deskLabel}>What feels overwhelming right now?</span>
                </div>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., Clean off the chaotic desk, start essay, organize taxes..."
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  disabled={loading}
                  autoFocus
                  aria-label="Task to break down"
                />
              </div>
              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={loading || !task.trim()}
              >
                {loading ? "Breaking into micro-steps..." : "Break Down into Micro-Steps"}
              </button>
            </form>
          ) : (
            <div className={styles.photoZoneWrapper}>
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
                <Camera size={28} className={styles.photoIcon} />
                <p className={styles.photoPrompt}>
                  {spatialLoading ? "Analyzing physical clutter in space..." : "Take or upload a photo of the messy room or desk"}
                </p>
                <p className={styles.photoSub}>
                  No typing needed. Tempo visually spotlights one actionable physical object at a time.
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
                aria-label={focusMode ? "Show all steps" : "Focus on single step"}
              >
                {focusMode ? (
                  <>
                    <List size={14} />
                    <span>Show all steps</span>
                  </>
                ) : (
                  <>
                    <Eye size={14} />
                    <span>Focus mode (one at a time)</span>
                  </>
                )}
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
              <span className={styles.focusStepBadge}>
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <p className={styles.focusStepText}>{steps[currentStepIndex]}</p>
              
              <button
                type="button"
                className={styles.focusDoneBtn}
                onClick={() => toggleStep(currentStepIndex)}
              >
                <CheckCircle2 size={16} />
                <span>Mark Step Complete</span>
              </button>
            </div>
          ) : (
            /* All Steps Checklist */
            <div className={styles.stepsList}>
              {steps.map((step, index) => {
                const isDone = completedSteps.has(index);
                return (
                  <button
                    key={index}
                    type="button"
                    className={`${styles.stepRow} ${isDone ? styles.stepDone : ""}`}
                    onClick={() => toggleStep(index)}
                    aria-pressed={isDone}
                  >
                    <div className={styles.stepCheckIcon}>
                      {isDone ? (
                        <CheckCircle2 size={20} className={styles.checkDoneIcon} />
                      ) : (
                        <Circle size={20} className={styles.circlePendingIcon} />
                      )}
                    </div>
                    <span className={styles.stepText}>{step}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className={styles.actionRow}>
            <button 
              type="button" 
              className={styles.outlineBtn}
              onClick={handleReset}
            >
              <RefreshCw size={14} />
              <span>Start new task</span>
            </button>
          </div>
        </section>
      ) : (
        /* 4. Completion State */
        <section className={styles.completionSection}>
          <div className={styles.celebrationCard}>
            <div className={styles.celebrationIcon}>
              <Sparkles size={28} />
            </div>
            <h2 className={styles.celebrationTitle}>All micro-steps completed!</h2>
            <p className={styles.celebrationDesc}>
              You broke through executive freeze and made real momentum.
            </p>

            <div className={styles.celebrationActions}>
              <button 
                type="button" 
                className={`${styles.saveBtn} ${saved ? styles.savedBtn : ""}`}
                onClick={handleSaveTask}
                disabled={saving || saved}
              >
                <Bookmark size={15} />
                <span>{saved ? "Saved to history" : saving ? "Saving..." : "Save privately"}</span>
              </button>
              
              <button 
                type="button" 
                className={styles.outlineBtn}
                onClick={handleReset}
              >
                <RefreshCw size={14} />
                <span>Start another task</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
