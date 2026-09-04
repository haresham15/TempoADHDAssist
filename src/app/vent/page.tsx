"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTempo } from "@/lib/TempoContext";
import AudioAnchorControl from "@/components/AudioAnchorControl";
import { 
  ChevronLeft, 
  Mic, 
  Square, 
  Edit3, 
  Bookmark, 
  RefreshCw, 
  Check,
  HeartHandshake
} from "lucide-react";
import styles from "./page.module.css";

export default function Vent() {
  const router = useRouter();
  const { setVentContext } = useTempo();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [isCrisis, setIsCrisis] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [volumes, setVolumes] = useState<number[]>([0.1, 0.1, 0.1, 0.1, 0.1]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [writtenText, setWrittenText] = useState("");
  const [recordSeconds, setRecordSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const updateWaveform = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const step = Math.floor(dataArray.length / 5);
    const newVolumes = [
      dataArray[0] / 255,
      dataArray[step] / 255,
      dataArray[step * 2] / 255,
      dataArray[step * 3] / 255,
      dataArray[step * 4] / 255,
    ];
    setVolumes(newVolumes);

    animationRef.current = requestAnimationFrame(updateWaveform);
  };

  const startRecording = async () => {
    setError("");
    setRecordSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        updateWaveform();
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Microphone access denied or not supported.");
      } else {
        setError("Microphone access denied or not supported.");
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        try {
          const response = await fetch("/api/vent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio: base64Audio }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to process audio.");
          }

          if (data.isCrisis) {
            setIsCrisis(true);
            return;
          }

          setTranscript(data.transcript || "");
          setReply(data.reply || "");
          if (data.transcript) {
            setVentContext(data.transcript);
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message || "An unexpected error occurred.");
          } else {
            setError("An unexpected error occurred.");
          }
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred while reading audio.");
      } else {
        setError("An error occurred while reading audio.");
      }
      setIsProcessing(false);
    }
  };

  const handleProcessWritten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writtenText.trim()) return;

    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/vent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: writtenText.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process written vent.");
      }

      if (data.isCrisis) {
        setIsCrisis(true);
        return;
      }

      setTranscript(writtenText.trim());
      setReply(data.reply || "");
      setVentContext(writtenText.trim());
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveReflection = async () => {
    if (saved || saving || !transcript) return;
    setSaving(true);
    try {
      const res = await fetch("/api/vent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          save: true,
          transcript,
          reply,
        }),
      });
      if (res.ok) {
        setSaved(true);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setIsCrisis(false);
    setTranscript("");
    setReply("");
    setWrittenText("");
    setError("");
    setSaved(false);
    setIsProcessing(false);
    setIsRecording(false);
    setRecordSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <main className={`page-container ${styles.container}`}>
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
          <Mic size={12} strokeWidth={2.2} /> Sensory Vent
        </span>
      </div>

      {/* 1. Crisis View */}
      {isCrisis ? (
        <section className={styles.crisisSection} aria-live="assertive">
          <div className={styles.crisisCard}>
            <div className={styles.crisisIconWrapper}>
              <HeartHandshake size={24} />
            </div>
            <h2 className={styles.crisisTitle}>A pause for something heavier</h2>
            <p className={styles.crisisIntro}>
              It sounds like you may be carrying something really heavy right now. You don&apos;t have to navigate this alone.
            </p>

            <div className={styles.resourceList}>
              <div className={styles.resourceItem}>
                <span className={styles.resourceName}>988 Suicide &amp; Crisis Lifeline</span>
                <span className={styles.resourceDetail}>Call or text <strong>988</strong> (Free, confidential, 24/7 in US &amp; Canada)</span>
              </div>
              <div className={styles.resourceItem}>
                <span className={styles.resourceName}>Crisis Text Line</span>
                <span className={styles.resourceDetail}>Text <strong>HOME</strong> to <strong>741741</strong> to connect with a counselor</span>
              </div>
            </div>

            <div className={styles.crisisActions}>
              <button type="button" className={styles.outlineBtn} onClick={handleReset}>
                Return to Vent
              </button>
            </div>
          </div>
        </section>
      ) : !transcript && !reply ? (
        /* 2. Recording / Input View */
        <section className={styles.recordingSection}>
          <header className={styles.header}>
            <h1 className={styles.pageTitle}>Unfiltered Sensory Vent</h1>
            <p className={styles.pageSubtitle}>
              Speak or write freely in a quiet, private space. No judgment, no destination.
            </p>
          </header>

          <div className={styles.topControls}>
            <AudioAnchorControl />
            <div className={styles.modeSwitch} role="tablist">
              <button
                type="button"
                className={`${styles.modeSwitchBtn} ${inputMode === "voice" ? styles.activeMode : ""}`}
                onClick={() => setInputMode("voice")}
                role="tab"
                aria-selected={inputMode === "voice"}
              >
                <Mic size={14} />
                <span>Voice Journal</span>
              </button>
              <button
                type="button"
                className={`${styles.modeSwitchBtn} ${inputMode === "text" ? styles.activeMode : ""}`}
                onClick={() => setInputMode("text")}
                role="tab"
                aria-selected={inputMode === "text"}
              >
                <Edit3 size={14} />
                <span>Written Vent</span>
              </button>
            </div>
          </div>

          {inputMode === "voice" ? (
            <div className={styles.voicePanel}>
              {/* Soft Waveform Metering */}
              <div className={styles.meterContainer}>
                <div className={styles.visualizerBars}>
                  {volumes.map((vol, i) => (
                    <div 
                      key={i} 
                      className={styles.meterBar} 
                      style={{ height: `${Math.max(14, Math.min(100, vol * 100))}%` }}
                    />
                  ))}
                </div>
                <div className={styles.timerRow}>
                  <span className={styles.timerDisplay}>
                    {formatTimer(recordSeconds)} / 01:00
                  </span>
                  <span className={styles.statusDisplay}>
                    {isProcessing ? "Reflecting on your words..." : isRecording ? "Listening closely..." : "Ready when you are"}
                  </span>
                </div>
              </div>

              <div className={styles.voiceActionRow}>
                {!isRecording ? (
                  <button 
                    type="button"
                    className={styles.primaryActionBtn}
                    onClick={startRecording}
                    disabled={isProcessing}
                  >
                    <Mic size={16} />
                    <span>Begin Voice Recording</span>
                  </button>
                ) : (
                  <button 
                    type="button"
                    className={`${styles.primaryActionBtn} ${styles.recordingActionBtn}`}
                    onClick={stopRecording}
                  >
                    <Square size={16} />
                    <span>Stop &amp; Reflect</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Written Vent Mode */
            <form onSubmit={handleProcessWritten} className={styles.textVentForm}>
              <div className={styles.deskInputPanel}>
                <div className={styles.deskHeader}>
                  <span className={styles.deskLabel}>Private Stream of Consciousness</span>
                </div>
                <textarea
                  className={styles.textVentArea}
                  placeholder="What is spinning in your mind right now? Unload it completely..."
                  value={writtenText}
                  onChange={(e) => setWrittenText(e.target.value)}
                  disabled={isProcessing}
                  autoFocus
                  rows={6}
                />
              </div>

              <button 
                type="submit" 
                className={styles.primaryActionBtn}
                disabled={isProcessing || !writtenText.trim()}
              >
                {isProcessing ? "Reflecting on thoughts..." : "Reflect on Vent"}
              </button>
            </form>
          )}

          {error && <div className={styles.error} role="alert">{error}</div>}
        </section>
      ) : (
        /* 3. Output Reflection View */
        <section className={styles.reflectionSection}>
          <div className={styles.transcriptBlock}>
            <span className={styles.blockKicker}>What you expressed</span>
            <p className={styles.transcriptQuote}>&ldquo;{transcript}&rdquo;</p>
          </div>

          <div className={styles.replyBlock}>
            <span className={styles.blockKicker}>Grounding Perspective</span>
            <div className={styles.replyText}>
              {reply.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSaveReflection}
              disabled={saving || saved}
            >
              {saved ? (
                <>
                  <Check size={15} />
                  <span>Saved to history</span>
                </>
              ) : (
                <>
                  <Bookmark size={15} />
                  <span>{saving ? "Saving..." : "Save privately"}</span>
                </>
              )}
            </button>
            <button type="button" className={styles.outlineBtn} onClick={handleReset}>
              <RefreshCw size={14} />
              <span>New vent session</span>
            </button>
          </div>

          {error && <div className={styles.error} role="alert">{error}</div>}
        </section>
      )}
    </main>
  );
}
