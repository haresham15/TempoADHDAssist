"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pause, Copy, Check } from "lucide-react";
import styles from "./page.module.css";
import { addHistory } from "@/lib/history";

export default function Triggered() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ emotion: string; translation: string } | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch("/api/rsd-buffer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to process message.");
      }

      const data = await response.json();
      setResult(data);
      
      addHistory({
        type: "trigger",
        summary: `Reframed '${message.slice(0, 30)}${message.length > 30 ? "..." : ""}'`,
        content: `Original: ${message}\nReframed: ${data.translation}`
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

  const handleCopy = () => {
    if (result?.translation) {
      navigator.clipboard.writeText(result.translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <main className={`page-container ${styles.container}`}>
      <button className={styles.backButton} onClick={() => router.push("/")}>
        <ArrowLeft className={styles.backIcon} strokeWidth={2} />
      </button>

      <header className={styles.header}>
        <div className={styles.pauseIconWrapper}>
          <Pause strokeWidth={2} className={styles.pauseIcon} />
        </div>
      </header>

      {!result ? (
        <section className={styles.inputSection}>
          <form onSubmit={handleProcess} className={styles.form}>
            <textarea
              className={styles.textarea}
              placeholder="Paste what they said, or what you're about to send."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              autoFocus
            />
            
            <button 
              type="submit" 
              className={`${styles.submitBtn} ${loading ? styles.loadingBtn : ""}`}
              disabled={loading || !message.trim()}
            >
              {loading ? "Taking a breath with this..." : "Help me see this clearly"}
            </button>
          </form>
          {error && <div className={styles.error}>{error}</div>}
        </section>
      ) : (
        <section className={styles.resultSection}>
          <div className={styles.cardsWrapper}>
            <div className={`${styles.resultCard} ${styles.emotionCard}`}>
              <h3>What you&apos;re feeling</h3>
              <p>{result.emotion}</p>
            </div>
            
            <div className={`${styles.resultCard} ${styles.translationCard}`}>
              <div className={styles.translationHeader}>
                <h3>A calmer way to say it</h3>
                <button 
                  className={styles.copyBtn} 
                  onClick={handleCopy}
                  title="Copy to clipboard"
                >
                  {copied ? <Check strokeWidth={2} className={styles.checkIcon} /> : <Copy strokeWidth={2} className={styles.copyIcon} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <textarea 
                className={styles.editTranslation} 
                value={result.translation}
                onChange={(e) => setResult({ ...result, translation: e.target.value })}
              />
            </div>
          </div>
          
          <div className={styles.actions}>
            <button className={styles.outlineBtn} onClick={() => { setResult(null); setMessage(""); }}>
              Start over
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
