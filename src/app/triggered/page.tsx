"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pause, Copy, Check, Bookmark, HeartHandshake, Sparkles } from "lucide-react";
import styles from "./page.module.css";

interface RsdResult {
  isCrisis?: boolean;
  emotion: string;
  pattern: string;
  translation: string;
  userReframe?: string;
}

const MAX_CHARS = 3000;

export default function Triggered() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [tryFirst, setTryFirst] = useState(false);
  const [userDraft, setUserDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RsdResult | null>(null);
  const [isCrisis, setIsCrisis] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || trimmed.length > MAX_CHARS) return;

    setLoading(true);
    setError("");
    setResult(null);
    setIsCrisis(false);
    setCopied(false);
    setSaved(false);

    try {
      const response = await fetch("/api/rsd-buffer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process message.");
      }

      if (data.isCrisis) {
        setIsCrisis(true);
        return;
      }

      setResult({
        emotion: data.emotion,
        pattern: data.pattern,
        translation: data.translation,
        userReframe: tryFirst && userDraft.trim() ? userDraft.trim() : undefined,
      });
      // Ephemeral by default: no auto-saving to database or localStorage
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

  const handleSavePrivately = async () => {
    if (!result || saved || saving) return;

    setSaving(true);
    try {
      const response = await fetch("/api/rsd-buffer/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalMessage: message,
          translation: result.translation,
          pattern: result.pattern,
          emotion: result.emotion,
          userReframe: result.userReframe,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save session.");
      }

      setSaved(true);
    } catch (err: unknown) {
      console.error("Save error:", err);
      setError("Unable to save session right now.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setIsCrisis(false);
    setMessage("");
    setUserDraft("");
    setError("");
    setSaved(false);
    setCopied(false);
  };

  return (
    <main className={`page-container ${styles.container}`}>
      <button 
        className={styles.backButton} 
        onClick={() => router.push("/")}
        aria-label="Back to home"
      >
        <ArrowLeft className={styles.backIcon} strokeWidth={2} />
      </button>

      <header className={styles.header}>
        <div className={styles.pauseIconWrapper}>
          <Pause strokeWidth={2} className={styles.pauseIcon} />
        </div>
      </header>

      {/* 1. Crisis View (Deterministic Safety Path) */}
      {isCrisis ? (
        <section className={styles.crisisSection} aria-live="assertive">
          <div className={styles.crisisCard}>
            <div className={styles.crisisIconWrapper}>
              <HeartHandshake className={styles.crisisIcon} strokeWidth={2} />
            </div>
            <h2 className={styles.crisisTitle}>A pause for something heavier</h2>
            <p className={styles.crisisIntro}>
              It sounds like you may be carrying something really heavy right now, and this is more than just a communication moment. You don&apos;t have to navigate this alone.
            </p>

            <div className={styles.resourceList}>
              <div className={styles.resourceItem}>
                <span className={styles.resourceName}>988 Suicide &amp; Crisis Lifeline</span>
                <span className={styles.resourceDetail}>Call or text <strong>988</strong> (Free, confidential, 24/7 in the US &amp; Canada)</span>
              </div>
              <div className={styles.resourceItem}>
                <span className={styles.resourceName}>Crisis Text Line</span>
                <span className={styles.resourceDetail}>Text <strong>HOME</strong> to <strong>741741</strong> to connect with a crisis counselor 24/7</span>
              </div>
              <div className={styles.resourceItem}>
                <span className={styles.resourceName}>International Support</span>
                <span className={styles.resourceDetail}>
                  Find confidential support services in your country at{" "}
                  <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className={styles.resourceLink}>
                    findahelpline.com
                  </a>
                </span>
              </div>
            </div>

            <div className={styles.crisisActions}>
              <button className={styles.outlineBtn} onClick={handleReset}>
                Go back
              </button>
            </div>
          </div>
        </section>
      ) : !result ? (
        /* 2. Input Screen */
        <section className={styles.inputSection}>
          <form onSubmit={handleProcess} className={styles.form}>
            <div className={styles.textareaWrapper}>
              <textarea
                className={styles.textarea}
                placeholder="Paste what they said, or what you're about to send."
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
                disabled={loading}
                autoFocus
                maxLength={MAX_CHARS}
                aria-label="Message to reframe"
              />
              <div className={styles.charCount} aria-live="polite">
                {message.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </div>
            </div>

            {/* Try It Yourself First Toggle */}
            <div className={styles.tryToggleRow}>
              <label className={styles.toggleLabel}>
                <input 
                  type="checkbox" 
                  checked={tryFirst} 
                  onChange={(e) => setTryFirst(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.toggleText}>
                  Try reframing first (Self-Regulation Practice)
                </span>
              </label>
            </div>

            {tryFirst && (
              <div className={styles.userDraftWrapper}>
                <label className={styles.draftLabel}>
                  Before seeing the AI reframe, how would you phrase this with calm boundaries?
                </label>
                <textarea
                  className={styles.userDraftTextarea}
                  placeholder="Your calm draft..."
                  value={userDraft}
                  onChange={(e) => setUserDraft(e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </div>
            )}

            <p className={styles.disclosure}>
              This is AI, not a therapist. Stays private — nothing is saved unless you choose to.
            </p>
            
            <button 
              type="submit" 
              className={`${styles.submitBtn} ${loading ? styles.loadingBtn : ""}`}
              disabled={loading || !message.trim()}
            >
              {loading 
                ? "Taking a breath with this..." 
                : tryFirst 
                  ? "Compare my reframe with AI" 
                  : "Help me see this clearly"}
            </button>
          </form>
          {error && <div className={styles.error} role="alert">{error}</div>}
        </section>
      ) : (
        /* 3. Results View */
        <section className={styles.resultSection}>
          {result.userReframe && (
            <div className={styles.celebrationCard}>
              <div className={styles.celebrationHeader}>
                <Sparkles size={18} className={styles.celebrationIcon} />
                <span>Great work taking a pause to reframe it yourself!</span>
              </div>
              <p className={styles.userReframeText}>
                <strong>Your version:</strong> &ldquo;{result.userReframe}&rdquo;
              </p>
            </div>
          )}

          <div className={styles.cardsWrapper}>
            {/* Emotion Reflection Card (Warm Blush) */}
            <div className={`${styles.resultCard} ${styles.emotionCard}`}>
              <h3>What you&apos;re feeling</h3>
              <p className={styles.emotionText}>{result.emotion}</p>
              
              {result.pattern && (
                <div className={styles.patternWrapper}>
                  <span className={styles.patternLabel}>Thinking pattern</span>
                  <span className={styles.patternPill}>{result.pattern}</span>
                </div>
              )}
            </div>
            
            {/* Calmer Translation Card (Soft Lavender) */}
            <div className={`${styles.resultCard} ${styles.translationCard}`}>
              <div className={styles.translationHeader}>
                <h3>A calmer way to say it</h3>
                <button 
                  type="button"
                  className={styles.copyBtn} 
                  onClick={handleCopy}
                  title="Copy to clipboard"
                  aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
                >
                  {copied ? (
                    <Check strokeWidth={2} className={styles.checkIcon} />
                  ) : (
                    <Copy strokeWidth={2} className={styles.copyIcon} />
                  )}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <textarea 
                className={styles.editTranslation} 
                value={result.translation}
                onChange={(e) => setResult({ ...result, translation: e.target.value })}
                aria-label="Editable reframed message"
              />
            </div>
          </div>
          
          {/* Actions: Save Privately (Opt-In) & Start Over */}
          <div className={styles.actions}>
            <button 
              type="button"
              className={`${styles.saveBtn} ${saved ? styles.savedBtn : ""}`}
              onClick={handleSavePrivately}
              disabled={saving || saved}
            >
              {saved ? (
                <>
                  <Check strokeWidth={2} className={styles.btnIcon} />
                  <span>Saved privately</span>
                </>
              ) : (
                <>
                  <Bookmark strokeWidth={2} className={styles.btnIcon} />
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

          {error && <div className={styles.error} role="alert">{error}</div>}
        </section>
      )}
    </main>
  );
}
