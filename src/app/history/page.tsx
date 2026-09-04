"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  History as HistoryIcon, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Brain, 
  Lightbulb, 
  Lock
} from "lucide-react";
import BrandHeader from "@/components/BrandHeader";
import styles from "./page.module.css";

interface RsdLog {
  id: string;
  created_at: string;
  original_message: string;
  neutral_translation: string;
  distortions: {
    emotion?: string;
    pattern?: string;
    user_reframe?: string;
  } | string;
}

function parseDistortions(raw: RsdLog["distortions"]) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

interface TaskChunk {
  id: string;
  created_at: string;
  original_task: string;
  steps: string[];
}

interface VentLog {
  id: string;
  created_at: string;
  transcript: string;
  ai_reply: string;
}

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<"insights" | "saved">("insights");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rsdLogs, setRsdLogs] = useState<RsdLog[]>([]);
  const [taskChunks, setTaskChunks] = useState<TaskChunk[]>([]);
  const [ventLogs, setVentLogs] = useState<VentLog[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.authenticated) {
          setIsAuthenticated(true);
          setRsdLogs(data.rsdLogs || []);
          setTaskChunks(data.taskChunks || []);
          setVentLogs(data.ventLogs || []);
        } else {
          setIsAuthenticated(false);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load history:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: string, table: "rsd_logs" | "task_chunks" | "vent_logs") => {
    if (!confirm("Are you sure you want to delete this reflection? This action cannot be undone.")) return;

    try {
      const res = await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, table }),
      });

      if (res.ok) {
        if (table === "rsd_logs") setRsdLogs((prev) => prev.filter((r) => r.id !== id));
        if (table === "task_chunks") setTaskChunks((prev) => prev.filter((t) => t.id !== id));
        if (table === "vent_logs") setVentLogs((prev) => prev.filter((v) => v.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Pattern aggregation calculation
  const patternStats = useMemo(() => {
    // If guest or no logs, provide realistic baseline patterns for demonstration
    const effectiveLogs = (isAuthenticated && rsdLogs.length > 0) 
      ? rsdLogs 
      : [
          { distortions: { pattern: "Your brain jumped to the worst-case version" } },
          { distortions: { pattern: "Treating brevity as anger" } },
          { distortions: { pattern: "Your brain jumped to the worst-case version" } },
          { distortions: { pattern: "Assuming they are disappointed in you" } },
          { distortions: { pattern: "Your brain jumped to the worst-case version" } },
          { distortions: { pattern: "Treating brevity as anger" } },
        ];

    const counts: Record<string, number> = {};
    let totalPatterns = 0;

    effectiveLogs.forEach((log) => {
      const parsed = parseDistortions(log.distortions);
      const p = parsed?.pattern;
      if (p) {
        counts[p] = (counts[p] || 0) + 1;
        totalPatterns++;
      }
    });

    const sorted = Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / (totalPatterns || 1)) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      total: totalPatterns,
      list: sorted,
      topPattern: sorted[0]?.name || "Worst-case interpretation",
    };
  }, [isAuthenticated, rsdLogs]);

  // Skill-building guidance based on top pattern
  const skillAdvice = useMemo(() => {
    const top = patternStats.topPattern.toLowerCase();
    if (top.includes("worst-case") || top.includes("jumped")) {
      return "When your brain instantly constructs the worst-case scenario, test the thought: What are 2 other completely mundane reasons they might have sent that message?";
    }
    if (top.includes("brevity") || top.includes("short")) {
      return "Brevity usually reflects the other person's busy environment, not their feelings toward you. Give silence and brevity the benefit of the doubt.";
    }
    return "Noticing the pattern is 80% of the battle. Every time you pause and name what your brain is doing, you weaken the automatic reflex.";
  }, [patternStats.topPattern]);

  return (
    <main className={`page-container ${styles.container}`}>
      <BrandHeader />

      <header className={styles.header}>
        <h1 className={styles.title}>History &amp; Insights</h1>
        <p className={styles.subtitle}>Track your emotional patterns and review past reflections.</p>
      </header>

      {/* Navigation Tabs */}
      <div className={styles.tabBar} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "insights"}
          className={`${styles.tabBtn} ${activeTab === "insights" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("insights")}
        >
          <Sparkles size={16} />
          <span>Pattern Insights</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "saved"}
          className={`${styles.tabBtn} ${activeTab === "saved" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("saved")}
        >
          <HistoryIcon size={16} />
          <span>Saved Reflections</span>
        </button>
      </div>

      {/* TAB 1: PATTERN INSIGHTS */}
      {activeTab === "insights" && (
        <section className={styles.contentSection}>
          {!isAuthenticated && (
            <div className={styles.authBanner}>
              <Lock size={22} color="var(--module-lavender)" />
              <div>
                <h4>Preview Mode (Sample Insights)</h4>
                <p>
                  Sign in with your email to connect your private sessions and view your personalized ADHD pattern recurrence.
                </p>
              </div>
              <Link href="/login" className={styles.authLinkBtn}>
                Sign In to Save History
              </Link>
            </div>
          )}

          {/* Metric Highlights */}
          <div className={styles.insightsSummaryGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Moments Paused</span>
              <div className={styles.metricValue}>{patternStats.total}</div>
              <span className={styles.metricNote}>Reframes reviewed</span>
            </div>

            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Primary Thinking Habit</span>
              <div className={styles.metricValue} style={{ fontSize: "1.2rem", marginTop: "0.25rem" }}>
                {patternStats.topPattern}
              </div>
              <span className={styles.metricNote}>Most frequent trigger</span>
            </div>
          </div>

          {/* Recurring Patterns Card */}
          <div className={styles.patternsCard}>
            <div className={styles.cardHeading}>
              <h3>Recurring Patterns</h3>
              <Brain size={20} color="var(--module-lavender)" />
            </div>

            <div className={styles.patternList}>
              {patternStats.list.map((item) => (
                <div key={item.name} className={styles.patternRow}>
                  <div className={styles.patternMeta}>
                    <span className={styles.patternName}>{item.name}</span>
                    <span className={styles.patternPercent}>{item.percent}%</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div 
                      className={styles.progressBarFill} 
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill-Building Insight */}
          <div className={styles.skillCard}>
            <div className={styles.skillHeading}>
              <Lightbulb size={18} className={styles.skillIcon} />
              <span>Tailored ADHD Reframing Skill</span>
            </div>
            <p className={styles.skillText}>{skillAdvice}</p>
          </div>
        </section>
      )}

      {/* TAB 2: SAVED REFLECTIONS TIMELINE */}
      {activeTab === "saved" && (
        <section className={styles.contentSection}>
          {!isAuthenticated ? (
            <div className={styles.emptyState}>
              <Lock size={32} color="var(--text-secondary)" />
              <h3 className={styles.emptyTitle}>Sign in to access your saved timeline</h3>
              <p className={styles.emptyText}>
                Tempo never stores guest data without explicit user intent. Sign in with a magic link to sync your private sessions across devices.
              </p>
              <Link href="/login" className={styles.authLinkBtn} style={{ marginTop: "0.5rem" }}>
                Sign In or Sign Up
              </Link>
            </div>
          ) : loading ? (
            <div className={styles.emptyState}>
              <p>Loading your saved sessions...</p>
            </div>
          ) : rsdLogs.length === 0 && taskChunks.length === 0 && ventLogs.length === 0 ? (
            <div className={styles.emptyState}>
              <HistoryIcon size={32} color="var(--text-secondary)" />
              <h3 className={styles.emptyTitle}>No saved sessions yet</h3>
              <p className={styles.emptyText}>
                When using the RSD Buffer, click &quot;Save privately&quot; after reviewing a message to keep it in your timeline.
              </p>
              <Link href="/triggered" className={styles.authLinkBtn} style={{ marginTop: "0.5rem" }}>
                Go to RSD Buffer
              </Link>
            </div>
          ) : (
            <div className={styles.timeline}>
              {/* RSD Logs */}
              {rsdLogs.map((log) => {
                const isExpanded = expandedId === log.id;
                return (
                  <div key={log.id} className={styles.sessionCard}>
                    <div 
                      className={styles.sessionHeader} 
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      <div className={styles.sessionTitleArea}>
                        <span className={`${styles.typeBadge} ${styles.badgeRsd}`}>RSD Buffer</span>
                        <span className={styles.sessionDate}>
                          {new Date(log.created_at).toLocaleDateString(undefined, { 
                            month: "short", 
                            day: "numeric", 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </span>
                      </div>

                      <div className={styles.sessionControls}>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(log.id, "rsd_logs");
                          }}
                          aria-label="Delete session"
                        >
                          <Trash2 size={16} />
                        </button>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    <p className={styles.sessionSnippet}>
                      &quot;{log.original_message.slice(0, 90)}{log.original_message.length > 90 ? "..." : ""}&quot;
                    </p>

                    {isExpanded && (() => {
                      const dist = parseDistortions(log.distortions);
                      return (
                        <div className={styles.expandedDetails}>
                          {dist.user_reframe && (
                            <div className={styles.detailRow}>
                              <span className={styles.detailLabel}>Your Practice Draft</span>
                              <span className={styles.detailContent} style={{ fontStyle: "italic" }}>
                                &ldquo;{dist.user_reframe}&rdquo;
                              </span>
                            </div>
                          )}
                          {dist.emotion && (
                            <div className={styles.detailRow}>
                              <span className={styles.detailLabel}>Emotion Reflected</span>
                              <span className={styles.detailContent}>{dist.emotion}</span>
                            </div>
                          )}
                          {dist.pattern && (
                            <div className={styles.detailRow}>
                              <span className={styles.detailLabel}>Thinking Pattern</span>
                              <span className={styles.detailContent}>{dist.pattern}</span>
                            </div>
                          )}
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Calmer Version</span>
                            <span className={styles.detailContent} style={{ color: "#4A3E66", fontWeight: 500 }}>
                              {log.neutral_translation}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}

              {/* Task Chunks */}
              {taskChunks.map((task) => (
                <div key={task.id} className={styles.sessionCard}>
                  <div className={styles.sessionHeader}>
                    <div className={styles.sessionTitleArea}>
                      <span className={`${styles.typeBadge} ${styles.badgeTask}`}>Task Chunks</span>
                      <span className={styles.sessionDate}>
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(task.id, "task_chunks")}
                      aria-label="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className={styles.sessionSnippet}>{task.original_task}</p>
                </div>
              ))}

              {/* Vent Logs */}
              {ventLogs.map((vent) => (
                <div key={vent.id} className={styles.sessionCard}>
                  <div className={styles.sessionHeader}>
                    <div className={styles.sessionTitleArea}>
                      <span className={`${styles.typeBadge} ${styles.badgeVent}`}>Voice Journal</span>
                      <span className={styles.sessionDate}>
                        {new Date(vent.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(vent.id, "vent_logs")}
                      aria-label="Delete session"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className={styles.sessionSnippet}>{vent.transcript}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
