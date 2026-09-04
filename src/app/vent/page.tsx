"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTempo } from "@/lib/TempoContext";
import { ArrowLeft, Mic, HeartHandshake, Check, Bookmark } from "lucide-react";
import AudioAnchorControl from "@/components/AudioAnchorControl";
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
  const [volumes, setVolumes] = useState<number[]>([0, 0, 0, 0, 0]); // 5 bars

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
    
    // Sample 5 distinct frequency bands
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
    chunksRef.current = [];
    setRecordSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup AudioContext for live frequency visualizer
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      updateWaveform();

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        processAudio(audioBlob);
        
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
        if (timerRef.current) clearInterval(timerRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      setError("Microphone access is required to use the Voice Journal.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      setVolumes([0, 0, 0, 0, 0]);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    const base64Audio = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    try {
      const response = await fetch("/api/vent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio: base64Audio,
          mimeType: audioBlob.type || "audio/webm",
        }),
      });

      if (!response.ok) throw new Error("Failed to process your reflection.");
      
      const data = await response.json();

      if (data.isCrisis) {
        setIsCrisis(true);
        setIsProcessing(false);
        return;
      }

      setTranscript(data.transcript);
      setReply(data.reply);
      setVentContext(data.transcript);
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

  const handleProcessWritten = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = writtenText.trim();
    if (!trimmed) return;

    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/vent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      if (!response.ok) throw new Error("Failed to reflect on your thoughts.");

      const data = await response.json();

      if (data.isCrisis) {
        setIsCrisis(true);
        setIsProcessing(false);
        return;
      }

      setTranscript(data.transcript);
      setReply(data.reply);
      setVentContext(data.transcript);
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
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <main className={`page-container ${styles.container}`}>
      <button 
        className={styles.backButton} 
        onClick={() => router.push("/")}
        aria-label="Back to home"
      >
        <ArrowLeft className={styles.backIcon} strokeWidth={2} />
      </button>

      {/* 1. Crisis View */}
      {isCrisis ? (
        <section className={styles.crisisSection} aria-live="assertive">
          <div className={styles.crisisCard}>
            <div className={styles.crisisIconWrapper}>
              <HeartHandshake className={styles.crisisIcon} strokeWidth={2} />
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
                <span className={styles.resourceDetail}>Text <strong>HOME</strong> to <strong>741741</strong> to connect with a crisis counselor</span>
              </div>
            </div>

            <div className={styles.crisisActions}>
              <button className={styles.outlineBtn} onClick={handleReset}>
                Go back
              </button>
            </div>
          </div>
        </section>
      ) : !transcript && !reply ? (
        /* 2. Recording / Input View */
        <section className={styles.recordingSection}>
          <AudioAnchorControl style={{ marginBottom: "16px" }} />
          {/* Sensory Mode Toggle: Voice vs Text */}
          <div className={styles.modeTabs}>
            <button
              type="button"
              className={`${styles.tabBtn} ${inputMode === "voice" ? styles.tabActive : ""}`}
              onClick={() => setInputMode("voice")}
            >
              <Mic size={14} /> Voice
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${inputMode === "text" ? styles.tabActive : ""}`}
              onClick={() => setInputMode("text")}
            >
              Write
            </button>
          </div>

          {inputMode === "voice" ? (
            <>
              <div className={styles.micWrapper}>
                <div className={`${styles.visualizer} ${isRecording ? styles.active : ""}`}>
                  {volumes.map((vol, i) => (
                    <div 
                      key={i} 
                      className={styles.bar} 
                      style={{ transform: `scaleY(${Math.max(0.2, vol * 1.5)})` }}
                    />
                  ))}
                </div>
                
                <button 
                  type="button"
                  className={`${styles.micButton} ${isRecording ? styles.recording : ""} ${isProcessing ? styles.processing : ""}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  aria-label={isRecording ? "Stop listening" : "Start speaking"}
                >
                  <Mic strokeWidth={2.5} className={styles.micIcon} />
                </button>
                
                {!isRecording && !isProcessing && <div className={styles.ambientRing} />}
              </div>

              {isRecording && (
                <div className={styles.timerBadge}>
                  <span className={styles.recordingDot} />
                  <span>{formatTimer(recordSeconds)}</span>
                </div>
              )}

              <div className={styles.statusText}>
                {isProcessing ? "Reflecting on your words..." : isRecording ? "I'm listening..." : "Tap to speak freely"}
              </div>
            </>
          ) : (
            /* Written Vent Mode */
            <form onSubmit={handleProcessWritten} className={styles.textVentForm}>
              <textarea
                className={styles.textVentArea}
                placeholder="What is spinning in your mind right now? Let it out..."
                value={writtenText}
                onChange={(e) => setWrittenText(e.target.value)}
                disabled={isProcessing}
                autoFocus
                rows={5}
                aria-label="Written vent thoughts"
              />
              <button
                type="submit"
                className={styles.textVentSubmitBtn}
                disabled={isProcessing || !writtenText.trim()}
              >
                {isProcessing ? "Reflecting..." : "Reflect"}
              </button>
            </form>
          )}

          {error && <div className={styles.error} role="alert">{error}</div>}
        </section>
      ) : (
        /* 3. Reflection Result */
        <section className={styles.resultSection}>
          <div className={styles.replyCard}>
            <p className={styles.replyText}>{reply}</p>
          </div>
          
          <div className={styles.transcriptCard}>
            <h3>What you shared:</h3>
            <p>{transcript}</p>
          </div>

          <div className={styles.actions}>
            <button 
              type="button"
              className={`${styles.saveBtn} ${saved ? styles.savedBtn : ""}`}
              onClick={handleSaveReflection}
              disabled={saving || saved}
            >
              {saved ? (
                <>
                  <Check size={16} />
                  <span>Saved to Reflections</span>
                </>
              ) : (
                <>
                  <Bookmark size={16} />
                  <span>{saving ? "Saving..." : "Save privately"}</span>
                </>
              )}
            </button>

            <button 
              type="button"
              className={styles.outlineBtn} 
              onClick={() => router.push("/overwhelmed")}
            >
              Help me break this into steps
            </button>

            <button 
              type="button"
              className={styles.textBtn} 
              onClick={handleReset}
            >
              Start over
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
