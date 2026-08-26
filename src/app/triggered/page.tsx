"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface Distortion {
  name: string;
  explanation: string;
}

interface BufferResponse {
  neutralTranslation: string;
  distortions: Distortion[];
}

export default function Triggered() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<BufferResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleProcessMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/rsd-buffer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to process message");
      }

      const data = await response.json();
      setResult(data);
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
          <span style={{ fontSize: "2rem" }}>🛡️</span> Communication Buffer
        </h1>
        <p className={styles.subtitle}>Process intense messages safely before responding.</p>
      </header>

      <div className={styles.disclaimer}>
        <strong>Note:</strong> Tempo is a digital tool, not a substitute for professional therapy or medical advice. 
        If you are in crisis, please seek immediate help from a healthcare provider.
      </div>

      <div className={styles.splitContainer}>
        <section className={styles.inputSection}>
          <form onSubmit={handleProcessMessage} className={styles.inputWrapper}>
            <textarea
              className={styles.textarea}
              placeholder="Paste a message you received that upset you, or a reply you drafted in anger/anxiety..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={loading || !message.trim()}
            >
              {loading ? <div className={styles.loadingSpinner} /> : "Mediator"}
            </button>
          </form>
          {error && <div className={styles.error}>{error}</div>}
        </section>

        <section className={styles.resultContainer}>
          {!result && !loading && (
            <div className={styles.emptyState}>
              <p>The mediator is ready to listen. Paste your thought on the left.</p>
            </div>
          )}
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner} />
              <p>Analyzing sentiment and facts...</p>
            </div>
          )}
          {result && (
            <div className={styles.resultContentWrapper}>
              <div className={styles.resultSection}>
                <h2 className={`${styles.resultTitle} ${styles.neutral}`}>
                  <span>✨</span> Fact-Check & Translation
                </h2>
                <div className={styles.resultContent}>
                  {result.neutralTranslation}
                </div>
              </div>

              {result.distortions && result.distortions.length > 0 && (
                <div className={styles.resultSection}>
                  <h2 className={`${styles.resultTitle} ${styles.distortions}`}>
                    <span>🔍</span> Cognitive Distortions Flagged
                  </h2>
                  <ul className={styles.distortionsList}>
                    {result.distortions.map((d: Distortion, index: number) => (
                      <li key={index} className={styles.distortionItem}>
                        <div className={styles.distortionName}>{d.name}</div>
                        <div className={styles.distortionDesc}>{d.explanation}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
