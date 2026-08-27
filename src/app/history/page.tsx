"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import BrandHeader from "@/components/BrandHeader";
import { getHistory, HistoryItem } from "@/lib/history";
import { createClient } from "@/lib/supabase/client";

export default function History() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch from all three tables
        const [tasks, rsds, vents] = await Promise.all([
          supabase.from('task_chunks').select('*').eq('user_id', user.id),
          supabase.from('rsd_logs').select('*').eq('user_id', user.id),
          supabase.from('vent_logs').select('*').eq('user_id', user.id)
        ]);

        const dbHistory: HistoryItem[] = [];

        tasks.data?.forEach(t => {
          dbHistory.push({
            id: t.id,
            type: "overwhelm",
            summary: `Broke down '${t.original_task.slice(0, 30)}${t.original_task.length > 30 ? "..." : ""}'`,
            timestamp: t.created_at,
            content: (t.steps as string[]).map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")
          });
        });

        rsds.data?.forEach(r => {
          dbHistory.push({
            id: r.id,
            type: "trigger",
            summary: `Reframed '${r.original_message.slice(0, 30)}${r.original_message.length > 30 ? "..." : ""}'`,
            timestamp: r.created_at,
            content: `Original: ${r.original_message}\nReframed: ${r.neutral_translation}`
          });
        });

        vents.data?.forEach(v => {
          dbHistory.push({
            id: v.id,
            type: "vent",
            summary: `Vented for a moment`,
            timestamp: v.created_at,
            content: `Transcript: ${v.transcript}\n\nTempo: ${v.ai_reply}`
          });
        });

        // Sort combined descending
        dbHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setHistoryItems(dbHistory);
      } else {
        setHistoryItems(getHistory());
      }
      setLoading(false);
    };

    fetchHistory();
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
        {loading ? (
          <p style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "2rem" }}>
            Loading history...
          </p>
        ) : historyItems.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "2rem" }}>
            Your history will appear here once you complete a session.
          </p>
        ) : historyItems.map((item) => (
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
