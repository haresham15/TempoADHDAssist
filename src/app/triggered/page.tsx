"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Clipboard, 
  Copy, 
  Check, 
  Sparkles, 
  Bookmark, 
  RefreshCw,
  HeartHandshake,
  ShieldCheck
} from "lucide-react";
import styles from "./page.module.css";

interface RsdResult {
  isCrisis?: boolean;
  emotion: string;
  pattern: string;
  translation: string;
  relationshipAnchor?: string;
  userReframe?: string;
}

const MAX_CHARS = 3000;

export default function Triggered() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [relationshipCategory, setRelationshipCategory] = useState("general");
  const [tryFirst, setTryFirst] = useState(false);
  const [userDraft, setUserDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RsdResult | null>(null);
  const [isCrisis, setIsCrisis] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setMessage((prev) => (prev ? prev + "\n" + text : text).slice(0, MAX_CHARS));
      }
    } catch (e) {
      console.error("Clipboard read error:", e);
    }
  };

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
        body: JSON.stringify({ 
          message: trimmed,
          relationshipContext: relationshipCategory !== "general" ? relationshipCategory : undefined
        }),
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
        relationshipAnchor: data.relationshipAnchor,
        userReframe: tryFirst && userDraft.trim() ? userDraft.trim() : undefined,
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
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleSavePrivately = async () => {
    if (!result || saving || saved) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "rsd",
          originalMessage: message,
          reframedMessage: result.translation,
          emotion: result.emotion,
          pattern: result.pattern,
          relationshipCategory: relationshipCategory,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save privately.");
      }
      setSaved(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to save session.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setMessage("");
    setUserDraft("");
    setResult(null);
    setIsCrisis(false);
    setError("");
    setCopied(false);
    setSaved(false);
  };

  const relationshipOptions = [
    { value: "general", label: "General" },
    { value: "manager", label: "Manager / Boss" },
    { value: "partner", label: "Partner" },
    { value: "friend", label: "Friend" },
    { value: "family", label: "Family" },
    { value: "colleague", label: "Colleague" },
  ];

  return (
    <main className={`page-container ${styles.container}`}>
      {/* Top Bar Navigation */}
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
          <Sparkles size={12} strokeWidth={2.2} /> Communication Buffer
        </span>
      </div>

      <header className={styles.header}>
        <h1 className={styles.pageTitle}>What message triggered you?</h1>
        <p className={styles.pageSubtitle}>
          Pause and find calm words before sending an impulsive, defensive reply.
        </p>
      </header>

      {/* 1. Crisis View (Deterministic Safety Path) */}
      {isCrisis ? (
        <section className={styles.crisisSection} aria-live="assertive">
          <div className={styles.crisisCard}>
            <div className={styles.crisisIconWrapper}>
              <HeartHandshake size={24} />
            </div>
            <h2 className={styles.crisisTitle}>A pause for something heavier</h2>
            <p className={styles.crisisIntro}>
              It sounds like you may be carrying something really heavy right now. This is more than just a communication moment, and you don&apos;t have to navigate it alone.
            </p>

            <div className={styles.resourceList}>
              <div className={styles.resourceItem}>
                <span className={styles.resourceName}>988 Suicide &amp; Crisis Lifeline</span>
                <span className={styles.resourceDetail}>Call or text <strong>988</strong> (Free, confidential, 24/7 in US &amp; Canada)</span>
              </div>
              <div className={styles.resourceItem}>
                <span className={styles.resourceName}>Crisis Text Line</span>
                <span className={styles.resourceDetail}>Text <strong>HOME</strong> to <strong>741741</strong> to connect with a crisis counselor 24/7</span>
              </div>
              <div className={styles.resourceItem}>
                <span className={styles.resourceName}>International Support</span>
                <span className={styles.resourceDetail}>
                  Find confidential support services worldwide at{" "}
                  <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className={styles.resourceLink}>
                    findahelpline.com
                  </a>
                </span>
              </div>
            </div>

            <div className={styles.crisisActions}>
              <button type="button" className={styles.outlineBtn} onClick={handleReset}>
                Return to Buffer
              </button>
            </div>
          </div>
        </section>
      ) : !result ? (
        /* 2. Input Screen */
        <section className={styles.inputSection}>
          <form onSubmit={handleProcess} className={styles.form}>
            <div className={styles.deskPanel}>
              <div className={styles.deskHeader}>
                <span className={styles.deskLabel}>Source Message</span>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className={styles.pasteBtn}
                  title="Paste from clipboard"
                  aria-label="Paste text from clipboard"
                >
                  <Clipboard size={12} />
                  <span>Paste clipboard</span>
                </button>
              </div>

              <textarea
                className={styles.textarea}
                placeholder="Paste the text message, Slack ping, or email that felt like a blow..."
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    if (!loading && message.trim()) {
                      handleProcess(e);
                    }
                  }
                }}
                disabled={loading}
                autoFocus
                maxLength={MAX_CHARS}
                aria-label="Message to reframe"
              />

              <div className={styles.deskFooter}>
                <span className={styles.charCount}>
                  {message.length} / {MAX_CHARS} chars
                </span>
                <span className={styles.shortcutHint}>Press Ctrl+Enter to reframe</span>
              </div>
            </div>

            {/* Context: Relationship Anchor */}
            <div className={styles.relationshipSection}>
              <div className={styles.fieldHeader}>
                <span className={styles.fieldLabel}>Who sent this?</span>
              </div>
              <div className={styles.segmentGrid}>
                {relationshipOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`${styles.segmentBtn} ${relationshipCategory === opt.value ? styles.activeSegment : ""}`}
                    onClick={() => setRelationshipCategory(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reframe First Option */}
            <div className={styles.reframeOptionSection}>
              <label className={styles.toggleRow}>
                <input
                  type="checkbox"
                  checked={tryFirst}
                  onChange={(e) => setTryFirst(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.toggleText}>
                  Draft my own calm reframe first before viewing suggestions
                </span>
              </label>

              {tryFirst && (
                <div className={styles.userDraftWrapper}>
                  <textarea
                    className={styles.userDraftTextarea}
                    placeholder="Type what you wish you could say calmly..."
                    value={userDraft}
                    onChange={(e) => setUserDraft(e.target.value)}
                    disabled={loading}
                    rows={3}
                  />
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className={`${styles.submitBtn} ${loading ? styles.loadingBtn : ""}`}
              disabled={loading || !message.trim()}
            >
              {loading ? "Finding perspective..." : "Reframe Message"}
            </button>
          </form>

          {error && <div className={styles.error} role="alert">{error}</div>}
        </section>
      ) : (
        /* 3. Results View */
        <section className={styles.resultSection}>
          {result.userReframe && (
            <div className={styles.userReframeBlock}>
              <span className={styles.blockKicker}>Your initial draft</span>
              <p className={styles.userReframeQuote}>&ldquo;{result.userReframe}&rdquo;</p>
            </div>
          )}

          {result.relationshipAnchor && (
            <div className={styles.anchorBlock}>
              <div className={styles.anchorHeader}>
                <ShieldCheck size={14} className={styles.anchorIcon} />
                <span className={styles.blockKicker}>Relationship Anchor</span>
              </div>
              <p className={styles.anchorBody}>{result.relationshipAnchor}</p>
            </div>
          )}

          {/* Core Deconstruction Layout */}
          <div className={styles.deconstructLayout}>
            {/* Emotion & Pattern Diagnosis */}
            <div className={styles.diagnosisBlock}>
              <div className={styles.diagnosisHeader}>
                <span className={styles.blockKicker}>Perceived Impact &amp; Emotion</span>
                {result.pattern && (
                  <span className={styles.patternBadge}>
                    {result.pattern}
                  </span>
                )}
              </div>
              <p className={styles.emotionBody}>{result.emotion}</p>
            </div>
            
            {/* Calmer Translation */}
            <div className={styles.translationBlock}>
              <div className={styles.translationHeaderRow}>
                <span className={styles.blockKicker}>Grounded Response</span>
                <button 
                  type="button"
                  className={styles.copyBtn} 
                  onClick={handleCopy}
                  title="Copy to clipboard"
                  aria-label={copied ? "Copied" : "Copy to clipboard"}
                >
                  {copied ? (
                    <>
                      <Check size={14} className={styles.checkIcon} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy text</span>
                    </>
                  )}
                </button>
              </div>
              <textarea 
                className={styles.editTranslation} 
                value={result.translation}
                onChange={(e) => setResult({ ...result, translation: e.target.value })}
                aria-label="Editable reframed message"
                rows={4}
              />
            </div>
          </div>
          
          {/* Actions: Save Privately & Reset */}
          <div className={styles.actionRow}>
            <button 
              type="button" 
              className={`${styles.saveBtn} ${saved ? styles.savedBtn : ""}`}
              onClick={handleSavePrivately}
              disabled={saving || saved}
            >
              {saved ? (
                <>
                  <Check size={15} />
                  <span>Saved to history</span>
                </>
              ) : (
                <>
                  <Bookmark size={15} />
                  <span>{saving ? "Saving..." : "Save privately"}</span>
                </>
              )}
            </button>

            <button 
              type="button" 
              className={styles.outlineBtn} 
              onClick={handleReset}
            >
              <RefreshCw size={14} />
              <span>Start new buffer</span>
            </button>
          </div>

          {error && <div className={styles.error} role="alert">{error}</div>}
        </section>
      )}
    </main>
  );
}
