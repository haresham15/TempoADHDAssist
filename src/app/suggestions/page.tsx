"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import { ChevronLeft, MessageSquareHeart, Check, Send, RefreshCw } from "lucide-react";
import styles from "./page.module.css";

const CATEGORIES = [
  { id: "feature", label: "Feature Idea" },
  { id: "usability", label: "Simplicity & Calm" },
  { id: "bug", label: "Bug Report" },
  { id: "other", label: "General Thought" },
];

export default function SuggestionsPage() {
  const router = useRouter();
  const [category, setCategory] = useState("feature");
  const [content, setContent] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError("Please write your suggestion before sending.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          content: trimmed,
          contactEmail: contactEmail.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send suggestion.");
      }

      setSubmitted(true);
      setContent("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to send suggestion right now. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`page-container ${styles.container}`}>
      <BrandHeader />

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
          <MessageSquareHeart size={12} strokeWidth={2.2} /> Feedback
        </span>
      </div>

      <div className={styles.contentWrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Suggestions &amp; Ideas</h1>
          <p className={styles.subtitle}>
            Help shape Tempo into a calmer, more supportive space for neurodivergent minds.
          </p>
        </header>

        {submitted ? (
          <div className={styles.successPanel}>
            <div className={styles.successIconWrapper}>
              <Check size={24} />
            </div>
            <h2 className={styles.successTitle}>Thank you for your thoughts</h2>
            <p className={styles.successText}>
              Your feedback directly shapes how Tempo supports emotional regulation and executive function.
            </p>
            <button 
              type="button"
              className={styles.actionBtn} 
              onClick={() => setSubmitted(false)}
            >
              <RefreshCw size={14} />
              <span>Send another suggestion</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Category Segment Selector */}
            <div className={styles.fieldSection}>
              <span className={styles.fieldLabel}>Category</span>
              <div className={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`${styles.catBtn} ${category === cat.id ? styles.activeCat : ""}`}
                    onClick={() => setCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Desk */}
            <div className={styles.deskPanel}>
              <div className={styles.deskHeader}>
                <span className={styles.deskLabel}>Your Thoughts &amp; Recommendations</span>
              </div>
              <textarea
                className={styles.textarea}
                placeholder="What feels helpful, cluttered, or missing? What would make this more comforting for you?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                disabled={loading}
                required
              />
            </div>

            {/* Optional Email */}
            <div className={styles.fieldSection}>
              <div className={styles.labelRow}>
                <span className={styles.fieldLabel}>Email Address</span>
                <span className={styles.optionalTag}>Optional (for follow-up)</span>
              </div>
              <input
                type="email"
                className={styles.emailInput}
                placeholder="you@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={loading || !content.trim()}
            >
              <Send size={15} />
              <span>{loading ? "Sending..." : "Send Suggestion"}</span>
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
