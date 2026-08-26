"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTempo } from "@/lib/TempoContext";
import { ArrowLeft, Mic } from "lucide-react";
import styles from "./page.module.css";

export default function Vent() {
  const router = useRouter();
  const { setVentContext } = useTempo();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [volumes, setVolumes] = useState<number[]>([0, 0, 0, 0, 0]); // 5 bars

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
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
    const newVolumes = Array(5).fill(0).map((_, i) => {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += dataArray[i * step + j];
      }
      return (sum / step) / 255; // Normalize 0 to 1
    });

    setVolumes(newVolumes);
    animationRef.current = requestAnimationFrame(updateWaveform);
  };

  const startRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up Audio Analyser
      const audioCtx = new window.AudioContext();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
        
        // Cleanup stream
        stream.getTracks().forEach(track => track.stop());
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
      };

      mediaRecorder.start();
      setIsRecording(true);
      updateWaveform();
    } catch (err: unknown) {
      setError("Microphone access is required to vent. Please allow permissions.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      setVolumes([0, 0, 0, 0, 0]);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "vent.webm");

    try {
      const response = await fetch("/api/vent", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to process your vent.");
      
      const data = await response.json();
      setTranscript(data.transcript);
      setReply(data.reply);
      setVentContext(data.transcript); 
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.");
      } else {
        setError("An unexpected error occurred.");
      }
      setIsProcessing(false);
    }
  };

  return (
    <main className={`page-container ${styles.container}`}>
      <button className={styles.backButton} onClick={() => router.push("/")}>
        <ArrowLeft className={styles.backIcon} strokeWidth={2} />
      </button>

      {!transcript && !reply ? (
        <section className={styles.recordingSection}>
          <div className={styles.micWrapper}>
            {/* Visualizer Bars */}
            <div className={`${styles.visualizer} ${isRecording ? styles.active : ""}`}>
              {volumes.map((vol, i) => (
                <div 
                  key={i} 
                  className={styles.bar} 
                  style={{ transform: `scaleY(${Math.max(0.2, vol * 1.5)})` }}
                />
              ))}
            </div>
            
            {/* Mic Button */}
            <button 
              className={`${styles.micButton} ${isRecording ? styles.recording : ""} ${isProcessing ? styles.processing : ""}`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
            >
              <Mic strokeWidth={2.5} className={styles.micIcon} />
            </button>
            
            {/* Ambient Ring for when idle */}
            {!isRecording && !isProcessing && <div className={styles.ambientRing} />}
          </div>

          <div className={styles.statusText}>
            {isProcessing ? "Finding the words..." : isRecording ? "I'm listening..." : "Tap to start venting"}
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </section>
      ) : (
        <section className={styles.resultSection}>
          <div className={styles.replyCard}>
            <p className={styles.replyText}>{reply}</p>
          </div>
          
          <div className={styles.transcriptCard}>
            <h3>What you said:</h3>
            <p>{transcript}</p>
          </div>

          <div className={styles.actions}>
            <button className={styles.outlineBtn} onClick={() => router.push("/overwhelmed")}>
              Help me break this down
            </button>
            <button className={styles.textBtn} onClick={() => router.push("/")}>
              I&apos;m done for now
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
