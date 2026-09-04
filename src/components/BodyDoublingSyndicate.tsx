"use client";

import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import styles from "./BodyDoublingSyndicate.module.css";

interface BodyDoublingSyndicateProps {
  className?: string;
}

export default function BodyDoublingSyndicate({ className = "" }: BodyDoublingSyndicateProps) {
  const [peerCount, setPeerCount] = useState<number>(4);
  const [recentEvent, setRecentEvent] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const clientId = "client_" + Math.random().toString(36).substring(7);

    const pingPresence = async () => {
      try {
        const res = await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId }),
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.activeCount) {
            setPeerCount(data.activeCount);
          }
        }
      } catch {
        // Quiet fallback
      }
    };

    pingPresence();
    const interval = setInterval(pingPresence, 35000);

    const encouragementPhrases = [
      "Someone just checked off a step",
      "A peer completed a micro-task",
      "Someone started their first step",
    ];

    const rippleInterval = setInterval(() => {
      if (!isMounted) return;
      const phrase = encouragementPhrases[Math.floor(Math.random() * encouragementPhrases.length)];
      setRecentEvent(phrase);
      setTimeout(() => {
        if (isMounted) setRecentEvent(null);
      }, 4200);
    }, 28000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearInterval(rippleInterval);
    };
  }, []);

  return (
    <div className={`${styles.syndicateWrapper} ${className}`} role="status" aria-live="polite">
      <div className={styles.presenceStrip} title="Anonymous co-working syndicate. Zero chat, zero video.">
        <Users size={12} className={styles.usersIcon} />
        <span className={styles.statusDot} aria-hidden="true" />
        <span className={styles.countText}>
          <span className={styles.peerNumber}>{peerCount} focusing right now</span>
          <span className={styles.divider}>&bull;</span>
          <span>Ambient Body Doubling</span>
        </span>
      </div>
      {recentEvent && <div className={styles.subtleEvent}>{recentEvent}</div>}
    </div>
  );
}
