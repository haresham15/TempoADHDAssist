"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { ChevronDown, ChevronUp } from "lucide-react";

type HistoryItem = {
  id: string;
  type: "overwhelm" | "trigger" | "vent";
  summary: string;
  timestamp: string;
  content: string;
};

// Mocked data for now
const mockHistory: HistoryItem[] = [
  {
    id: "1",
    type: "vent",
    summary: "Talked about work stress",
    timestamp: "2 hours ago",
    content: "I've been feeling really overwhelmed with the new project deadlines. My manager keeps changing the requirements and I don't know how to keep up.",
  },
  {
    id: "2",
    type: "overwhelm",
    summary: "Broke down 'Clean the kitchen'",
    timestamp: "Yesterday",
    content: "1. Empty dishwasher\n2. Load dirty plates\n3. Wipe counters",
  },
  {
    id: "3",
    type: "trigger",
    summary: "Reframed an email from Sarah",
    timestamp: "3 days ago",
    content: "Original: 'Why did you do that?'\nReframed: 'Could you help me understand the reasoning behind this?'",
  },
];

export default function History() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      <header className={styles.header}>
        <h1 className={styles.title}>History</h1>
        <p className={styles.subtitle}>Past sessions and reflections.</p>
      </header>

      <section className={styles.list}>
        {mockHistory.map((item) => (
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
                <span className={styles.timestamp}>{item.timestamp}</span>
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
