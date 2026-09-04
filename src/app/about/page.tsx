import Link from "next/link";
import { ArrowLeft, Shield, Heart, Sparkles, MessagesSquare, ListTree, Mic, HelpCircle, MessageSquare } from "lucide-react";
import BrandHeader from "@/components/BrandHeader";
import styles from "./page.module.css";

export const metadata = {
  title: "About Tempo | RSD Communication Buffer & Calm Space",
  description: "Learn why Tempo exists, how our zero-destination buffer works, and our commitment to privacy for neurodivergent minds.",
};

export default function AboutPage() {
  return (
    <main className={`page-container ${styles.container}`}>
      <BrandHeader />

      <Link href="/" className={styles.backButton} aria-label="Back to home">
        <ArrowLeft className={styles.backIcon} strokeWidth={2} />
      </Link>

      <article className={styles.article}>
        {/* Header */}
        <header className={styles.header}>
          <span className={styles.kicker}>Our Story &amp; Philosophy</span>
          <h1 className={styles.title}>A quiet pause before you react.</h1>
          <p className={styles.lead}>
            Tempo is an AI-assisted emotional regulation space designed specifically for the intense moments of Rejection Sensitive Dysphoria (RSD), ADHD executive paralysis, and emotional overwhelm.
          </p>
        </header>

        {/* The Problem & The Solution */}
        <section className={styles.section}>
          <h2>Why Tempo Exists</h2>
          <p>
            When you live with ADHD or rejection sensitivity, a vague email from a boss, an unanswered text message, or perceived criticism doesn&apos;t just feel uncomfortable—it triggers a visceral, full-body alarm response. In clinical psychology, this is known as Rejection Sensitive Dysphoria (RSD).
          </p>
          <p>
            In that moment of fight-or-flight, the prefrontal cortex goes offline. The urge to send an impulsive, defensive, or overly apologetic message is almost irresistible. Afterward comes the shame spiral.
          </p>
          <p>
            <strong>Tempo provides the missing circuit breaker.</strong> It gives you a calm, zero-stakes buffer to paste what happened, unpack your raw emotions without judgment, identify cognitive thinking patterns, and discover grounded words you won&apos;t regret.
          </p>
        </section>

        {/* Three Core Commitments */}
        <section className={styles.commitmentsSection}>
          <h2>Built on Three Principles</h2>
          <div className={styles.cardsGrid}>
            <div className={styles.principleCard}>
              <div className={styles.principleIconWrapper}>
                <Shield size={22} className={styles.principleIcon} />
              </div>
              <h3>1. Zero Destination</h3>
              <p>
                Tempo has zero integration with your email, messaging apps, or contacts. It is physically impossible to accidentally send a draft to a recipient. It is a one-way mirror for your own clarity.
              </p>
            </div>

            <div className={styles.principleCard}>
              <div className={styles.principleIconWrapper}>
                <Heart size={22} className={styles.principleIcon} />
              </div>
              <h3>2. Ephemeral First</h3>
              <p>
                Your thoughts belong to you. Sessions are processed ephemerally and never written to a database unless you explicitly tap &ldquo;Save privately&rdquo;.
              </p>
            </div>

            <div className={styles.principleCard}>
              <div className={styles.principleIconWrapper}>
                <Sparkles size={22} className={styles.principleIcon} />
              </div>
              <h3>3. Shame-Free Clarity</h3>
              <p>
                We do not dismiss your feelings or tell you to &ldquo;calm down&rdquo;. We validate your emotional truth first, identify distorted cognitive filters, and help you speak with calm authority.
              </p>
            </div>
          </div>
        </section>

        {/* The Three Tools */}
        <section className={styles.toolsSection}>
          <h2>The Three Spaces</h2>
          <div className={styles.toolsList}>
            <Link href="/triggered" className={styles.toolItem}>
              <div className={styles.toolIconWrapper}>
                <MessagesSquare size={20} />
              </div>
              <div className={styles.toolContent}>
                <h3>Communication Buffer</h3>
                <p>Paste a triggering message or draft. See the emotional pattern and get a calm, neutral reframe in 30 seconds.</p>
              </div>
            </Link>

            <Link href="/overwhelmed" className={styles.toolItem}>
              <div className={styles.toolIconWrapper}>
                <ListTree size={20} />
              </div>
              <div className={styles.toolContent}>
                <h3>Task Chunker</h3>
                <p>Dissolve ADHD task freeze. Break overwhelming projects into low-resistance micro-steps you can actually start.</p>
              </div>
            </Link>

            <Link href="/vent" className={styles.toolItem}>
              <div className={styles.toolIconWrapper}>
                <Mic size={20} />
              </div>
              <div className={styles.toolContent}>
                <h3>Sensory Vent</h3>
                <p>A private audio or written space to release mental pressure and receive gentle, reflective listening.</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Next Links */}
        <section className={styles.nextSection}>
          <div className={styles.quickLinks}>
            <Link href="/faq" className={styles.linkCard}>
              <HelpCircle size={18} />
              <div>
                <strong>Frequently Asked Questions</strong>
                <span>Common questions about privacy, billing, and science.</span>
              </div>
            </Link>
            <Link href="/suggestions" className={styles.linkCard}>
              <MessageSquare size={18} />
              <div>
                <strong>Share a Suggestion</strong>
                <span>Help us shape Tempo&apos;s future.</span>
              </div>
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
