"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, CheckCircle2, MessageSquare } from "lucide-react";
import BrandHeader from "@/components/BrandHeader";
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

      <button 
        className={styles.backButton} 
        onClick={() => router.push("/")}
        aria-label="Back to home"
      >
        <ArrowLeft className={styles.backIcon} strokeWidth={2} />
      </button>

      <div className={styles.contentWrapper}>
        <header className={styles.header}>
          <div className={styles.iconBadge}>
            <MessageSquare size={22} className={styles.headerIcon} />
          </div>
          <h1 className={styles.title}>Suggestions &amp; Ideas</h1>
          <p className={styles.subtitle}>
            Tempo is built to be a calm, distraction-free sanctuary. Have an idea to make it simpler, better, or gentler? We&apos;d love to hear it.
          </p>
        </header>

        {submitted ? (
          <div className={styles.successCard} aria-live="polite">
            <div className={styles.successIconWrapper}>
              <CheckCircle2 size={36} className={styles.successIcon} />
            </div>
            <h2>Thank you for your voice</h2>
            <p>
              Your suggestion has been received. We review every note to keep Tempo focused, minimal, and genuinely supportive for neurodivergent minds.
            </p>
            <div className={styles.successActions}>
              <button 
                type="button" 
                className={styles.secondaryBtn}
                onClick={() => setSubmitted(false)}
              >
                Send another suggestion
              </button>
              <button 
                type="button" 
                className={styles.primaryBtn}
                onClick={() => router.push("/")}
              >
                Return home
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Category selection */}
            <div className={styles.categorySection}>
              <label className={styles.sectionLabel}>What is this about?</label>
              <div className={styles.categoryPills}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`${styles.catPill} ${category === cat.id ? styles.catPillActive : ""}`}
                    onClick={() => setCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content text */}
            <div className={styles.inputGroup}>
              <label htmlFor="suggestion-content" className={styles.sectionLabel}>
                Your suggestion
              </label>
              <textarea
                id="suggestion-content"
                className={styles.textarea}
                placeholder="What would make Tempo better or easier for you?..."
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 3000))}
                rows={5}
                required
                disabled={loading}
              />
              <div className={styles.charCount}>
                {content.length} / 3,000
              </div>
            </div>

            {/* Optional email */}
            <div className={styles.inputGroup}>
              <label htmlFor="suggestion-email" className={styles.sectionLabel}>
                Email <span className={styles.optionalTag}>(Optional, if you&apos;d like a reply)</span>
              </label>
              <input
                id="suggestion-email"
                type="email"
                className={styles.emailInput}
                placeholder="you@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && <div className={styles.error} role="alert">{error}</div>}

            <button
              type="submit"
              className={`${styles.submitBtn} ${loading ? styles.loadingBtn : ""}`}
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
