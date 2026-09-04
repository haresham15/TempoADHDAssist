"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Sliders, CheckCircle2 } from "lucide-react";
import BrandHeader from "@/components/BrandHeader";
import styles from "./page.module.css";

export default function Settings() {
  const router = useRouter();

  return (
    <main className={`page-container ${styles.container}`}>
      <BrandHeader />
      
      <div className={styles.backWrapper}>
        <button 
          className={styles.backButton} 
          onClick={() => router.push("/")}
          aria-label="Back to home"
        >
          <ArrowLeft size={20} />
          <span>Back to Tempo</span>
        </button>
      </div>

      <section className={styles.deferredCard}>
        <div className={styles.iconCircle}>
          <Sliders size={28} strokeWidth={1.8} />
        </div>
        <h1 className={styles.deferredTitle}>Settings are Deferred in V2</h1>
        
        <p className={styles.deferredText}>
          To maintain absolute trust, Tempo does not show decorative controls that lack real persistence. In V1, the app automatically and honestly honors your system preferences:
        </p>

        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <CheckCircle2 size={18} className={styles.featureIcon} />
            <div>
              <strong>Low-Stimulation Theme:</strong> Respects your system dark mode or light warm ivory palette automatically.
            </div>
          </div>
          <div className={styles.featureItem}>
            <CheckCircle2 size={18} className={styles.featureIcon} />
            <div>
              <strong>Reduced Motion:</strong> Fully disables all ambient background drift and transitions when system <code>prefers-reduced-motion</code> is active.
            </div>
          </div>
        </div>

        <button 
          className={styles.homeBtn}
          onClick={() => router.push("/")}
        >
          Return to Flagship Buffer
        </button>
      </section>
    </main>
  );
}
