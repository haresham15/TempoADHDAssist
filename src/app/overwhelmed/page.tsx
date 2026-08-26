"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTempo } from "@/lib/TempoContext";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";
import { addHistory } from "@/lib/history";

export default function Overwhelmed() {
  const router = useRouter();
  const { ventContext } = useTempo();
  const [task, setTask] = useState(ventContext || "");
  const [steps, setSteps] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChunkTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    setLoading(true);
    setError("");
    setSteps([]);
    setCompletedSteps(new Set());

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
      
      addHistory({
        type: "overwhelm",
        summary: `Broke down '${task.slice(0, 30)}${task.length > 30 ? "..." : ""}'`,
        content: data.steps.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")
      });
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
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const allCompleted = steps.length > 0 && completedSteps.size === steps.length;

  return (
    <main className={`page-container ${styles.container}`}>
      <button className={styles.backButton} onClick={() => router.push("/")}>
        <ArrowLeft className={styles.backIcon} strokeWidth={2} /> 
      </button>

      {steps.length === 0 && (
        <section className={styles.inputSection}>
          <form onSubmit={handleChunkTask} className={styles.inputWrapper}>
            <input
              type="text"
              className={styles.input}
              placeholder="What's the one thing on your mind?"
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
              {loading ? <span className={styles.pulseText}>Breaking it down...</span> : "Break it down"}
            </button>
          </form>
          {error && <div className={styles.error}>{error}</div>}
        </section>
      )}

      {steps.length > 0 && !allCompleted && (
        <section className={styles.stepsContainer}>
          {steps.map((step: string, index: number) => {
            const isCompleted = completedSteps.has(index);
            return (
              <div 
                key={index} 
                className={`${styles.stepCard} ${isCompleted ? styles.completedCard : ""}`}
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                <button 
                  className={`${styles.checkbox} ${isCompleted ? styles.checked : ""}`}
                  onClick={() => toggleStep(index)}
                  aria-label="Mark complete"
                >
                  {isCompleted && <Check strokeWidth={3} className={styles.checkIcon} />}
                </button>
                <div className={styles.stepText}>{step}</div>
              </div>
            );
          })}
        </section>
      )}
      
      {allCompleted && (
        <section className={styles.successContainer}>
          <h2>That&apos;s the whole thing, done.</h2>
          <button className={styles.outlineBtn} onClick={() => { setSteps([]); setTask(""); setCompletedSteps(new Set()); }}>
            Start something else
          </button>
        </section>
      )}
    </main>
  );
}
