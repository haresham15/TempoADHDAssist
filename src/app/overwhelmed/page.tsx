"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Overwhelmed() {
  const router = useRouter();
  const [task, setTask] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChunkTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    setLoading(true);
    setError("");
    setSteps([]);

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

      {steps.length > 0 && (
        <section className={styles.stepsContainer}>
          {steps.map((step: string, index: number) => (
            <div 
              key={index} 
              className={styles.stepCard}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className={styles.stepNumber}>{index + 1}</div>
              <div className={styles.stepText}>{step}</div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
