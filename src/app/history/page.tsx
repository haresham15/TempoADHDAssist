"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import BrandHeader from "@/components/BrandHeader";
import { getHistory, HistoryItem } from "@/lib/history";

export default function History() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistoryItems(getHistory());
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getDotColor = (type: string) => {
    switch (type) {
      case "overwhelm": return styles.dotSage;
      case "trigger": return styles.dotLavender;
      case "vent": return styles.dotBlush;
      default: return "";
    }
  };

  return (
    <main className={`page-container ${styles.container}`}>
      <BrandHeader />
      <header className={styles.header}>
        <h1 className={styles.title}>History</h1>
        <p className={styles.subtitle}>Past sessions and reflections.</p>
      </header>

      <section className={styles.list}>
        {historyItems.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "2rem" }}>
            Your history will appear here once you complete a session.
          </p>
        )}
        {historyItems.map((item) => (
          <div 
            key={item.id} 
            className={`${styles.card} ${expandedId === item.id ? styles.expanded : ""}`}
            onClick={() => toggleExpand(item.id)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <div className={`${styles.dot} ${getDotColor(item.type)}`} />
                <span className={styles.summary}>{item.summary}</span>
              </div>
              <div className={styles.cardMeta}>
                <span className={styles.timestamp}>
                  {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {expandedId === item.id ? (
                  <ChevronUp className={styles.chevron} strokeWidth={2} />
                ) : (
                  <ChevronDown className={styles.chevron} strokeWidth={2} />
                )}
              </div>
            </div>
            
            <div className={styles.cardContentWrapper}>
              <div className={styles.cardContent}>
                <p>{item.content}</p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
