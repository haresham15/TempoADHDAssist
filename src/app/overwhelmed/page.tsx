"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTempo } from "@/lib/TempoContext";
import styles from "./page.module.css";

export default function Overwhelmed() {
  const router = useRouter();
  const { ventContext } = useTempo();
  const [task, setTask] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ventContext) {
      setTask(ventContext);
    }
  }, [ventContext]);

  const handleChunkTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    setLoading(true);
    setError("");
    setSteps([]);
    setCurrentStepIndex(0);

    try {
      const response = await fetch("/api/chunk-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });

      if (!response.ok) {
        throw new Error("Failed to break down task");
      }

      const data = await response.json();
      setSteps(data.steps);
    } catch (err) {
      setError("Oops, something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <button className={styles.backButton} onClick={() => router.push("/")}>
        &larr; Back to Hub
      </button>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <span style={{ fontSize: "2rem" }}>🧩</span> Task Chunker
        </h1>
        <p className={styles.subtitle}>Break big things into small physical actions.</p>
      </header>

      <section className={styles.inputSection}>
        <form onSubmit={handleChunkTask} className={styles.inputWrapper}>
          <input
            type="text"
            className={styles.input}
            placeholder="What's on your mind? (e.g., Clean my room)"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={loading || !task.trim()}
          >
            {loading ? <div className={styles.loadingSpinner} /> : "Break it down"}
          </button>
        </form>
        {error && <div className={styles.error}>{error}</div>}
      </section>

      {steps.length > 0 && currentStepIndex < steps.length && (
        <section className={styles.stepsContainer}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>{currentStepIndex + 1}</div>
            <div className={styles.stepText}>{steps[currentStepIndex]}</div>
            <button 
              className={styles.doneBtn}
              onClick={() => setCurrentStepIndex(i => i + 1)}
            >
              Done ✨
            </button>
          </div>
          <div className={styles.progressText}>
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </section>
      )}
      
      {steps.length > 0 && currentStepIndex >= steps.length && (
        <section className={styles.successContainer}>
          <h2>You did it! 🎉</h2>
          <p>Total steps supported: {steps.length}</p>
          <button className={styles.submitBtn} onClick={() => { setSteps([]); setTask(""); }}>
            Start Another Task
          </button>
        </section>
      )}
    </main>
  );
}
