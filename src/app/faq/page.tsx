"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import BrandHeader from "@/components/BrandHeader";
import styles from "./page.module.css";

interface FaqItem {
  question: string;
  answer: string;
  category: "privacy" | "science" | "tools" | "billing";
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: "privacy",
    question: "Will Tempo ever send my message to the recipient?",
    answer: "Never. Tempo has zero integration with your email, iMessage, WhatsApp, Slack, or any communication platform. It is a completely isolated one-way buffer for your personal clarity. It is physically impossible to accidentally dispatch a message from Tempo to anyone else.",
  },
  {
    category: "privacy",
    question: "Is what I write stored or used to train AI models?",
    answer: "By default, your sessions are completely ephemeral. When you navigate away, the text disappears. We only persist a session if you explicitly click 'Save privately' while signed in. Your private entries are stored in your own secure account and are never sold or used for public AI model training.",
  },
  {
    category: "science",
    question: "What is Rejection Sensitive Dysphoria (RSD)?",
    answer: "Rejection Sensitive Dysphoria (RSD) is an extreme emotional sensitivity and psychological pain triggered by the perception—not necessarily the reality—that you have been rejected, criticized, or failed. Common in ADHD and neurodivergent individuals, it causes rapid nervous system activation where the emotional urge to defend oneself or freeze can feel overwhelming.",
  },
  {
    category: "science",
    question: "How does the AI reframing work?",
    answer: "When you paste a triggering situation, Tempo's dual-engine cognitive processor validates the underlying emotion (e.g. fear, shame, defensiveness), identifies common cognitive filters (such as Mind Reading, Catastrophizing, or All-or-Nothing thinking), and generates a calm, grounded communication alternative that protects your boundaries without reactive escalation.",
  },
  {
    category: "tools",
    question: "How does the Task Chunker help ADHD executive dysfunction?",
    answer: "ADHD executive paralysis often occurs when a task feels too amorphous or emotionally loaded. The Task Chunker takes a big goal and finds the true 'gateway micro-step'—an action taking under 60 seconds with almost zero resistance. Once inertia is broken, momentum takes over naturally.",
  },
  {
    category: "tools",
    question: "Can I use Tempo on mobile?",
    answer: "Yes. Tempo is built mobile-first with ergonomic bottom navigation and 44px touch targets. You can open it in mobile Safari or Chrome and use 'Add to Home Screen' to use it like a native app anytime you feel triggered on the go.",
  },
  {
    category: "billing",
    question: "What is Tempo Plus?",
    answer: "Tempo is free to use for core daily emotional regulation. Tempo Plus ($9/month or $79/year) provides unlimited deep cognitive reframes, personalized recurring pattern insights, custom tone adjustments, and priority response times. You can upgrade or cancel anytime with one click.",
  },
  {
    category: "billing",
    question: "What if I am in a crisis or mental health emergency?",
    answer: "Tempo is an AI communication coach and self-regulation tool, not medical care or crisis counseling. If our safety system detects crisis or self-harm keywords, it immediately halts AI generation and presents direct 24/7 free resources: the 988 Suicide & Crisis Lifeline (call/text 988) and the Crisis Text Line (text HOME to 741741).",
  },
];

export default function FaqPage() {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set([0, 1]));
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const toggleAccordion = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    if (activeCategory === "all") return true;
    return item.category === activeCategory;
  });

  return (
    <main className={`page-container ${styles.container}`}>
      <BrandHeader />

      <Link href="/" className={styles.backButton} aria-label="Back to home">
        <ArrowLeft className={styles.backIcon} strokeWidth={2} />
      </Link>

      <div className={styles.contentWrapper}>
        <header className={styles.header}>
          <div className={styles.iconBadge}>
            <HelpCircle size={22} className={styles.headerIcon} />
          </div>
          <h1 className={styles.title}>Frequently Asked Questions</h1>
          <p className={styles.subtitle}>
            Clear answers on privacy, how reframing works, and the science of rejection sensitivity.
          </p>

          {/* Category Filter Pills */}
          <div className={styles.filterPills}>
            <button
              type="button"
              className={`${styles.filterPill} ${activeCategory === "all" ? styles.filterPillActive : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${activeCategory === "privacy" ? styles.filterPillActive : ""}`}
              onClick={() => setActiveCategory("privacy")}
            >
              Privacy &amp; Safety
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${activeCategory === "science" ? styles.filterPillActive : ""}`}
              onClick={() => setActiveCategory("science")}
            >
              RSD &amp; Science
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${activeCategory === "tools" ? styles.filterPillActive : ""}`}
              onClick={() => setActiveCategory("tools")}
            >
              Tools &amp; Usage
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${activeCategory === "billing" ? styles.filterPillActive : ""}`}
              onClick={() => setActiveCategory("billing")}
            >
              Plans &amp; Crisis
            </button>
          </div>
        </header>

        {/* Accordion List */}
        <div className={styles.faqList}>
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndices.has(idx);
            return (
              <div key={faq.question} className={`${styles.faqCard} ${isOpen ? styles.faqCardOpen : ""}`}>
                <button
                  type="button"
                  className={styles.faqQuestionBtn}
                  onClick={() => toggleAccordion(idx)}
                  aria-expanded={isOpen}
                >
                  <span className={styles.faqQuestionText}>{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={`${styles.chevron} ${isOpen ? styles.chevronRotated : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className={styles.faqAnswer} aria-live="polite">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Suggestion / Help Footer */}
        <div className={styles.helpFooter}>
          <p>Have a question that isn&apos;t answered here?</p>
          <Link href="/suggestions" className={styles.suggestionLink}>
            <MessageSquare size={14} />
            <span>Send us a suggestion or question</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
