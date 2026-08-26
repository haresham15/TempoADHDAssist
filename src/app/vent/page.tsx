"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTempo } from "@/lib/TempoContext";
import styles from "./page.module.css";

export default function Vent() {
  const router = useRouter();
  const { setVentContext } = useTempo();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleAudioStop;
      mediaRecorder.start();
      setIsRecording(true);
      setError("");
      setResponse("");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      // Stop all tracks to turn off the mic light
      mediaRecorderRef.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
  };

  const handleAudioStop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    
    // Read blob as base64 to send in JSON payload
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = (reader.result as string).split(',')[1];
      
      try {
        const res = await fetch("/api/vent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audio: base64Audio, mimeType: audioBlob.type }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to process audio");
        }
        
        setResponse(data.reply);
        if (data.transcript) {
          setVentContext(data.transcript);
        }
        speakResponse(data.reply);
      } catch (err) {
        console.error(err);
        setError("Could not process audio. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    };
  };

  const speakResponse = (text: string) => {
    if ("speechSynthesis" in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower, calmer
      utterance.pitch = 1.0;
      
      // Try to find a good female/calm voice if available
      const voices = window.speechSynthesis.getVoices();
      const calmVoice = voices.find(v => v.name.includes("Samantha") || v.name.includes("Google UK English Female") || v.name.includes("Natural"));
      if (calmVoice) {
        utterance.voice = calmVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <main className={styles.container}>
      <button className={styles.backButton} onClick={() => {
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
        router.push("/");
      }}>
        &larr; Back to Hub
      </button>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <span style={{ fontSize: "2rem" }}>🎙️</span> Voice Journal
        </h1>
        <p className={styles.subtitle}>Vocally brain-dump your stress and anxiety.</p>
      </header>

      <div className={styles.micContainer}>
        <button
          className={`${styles.micButton} ${isRecording ? styles.recording : ""} ${isProcessing ? styles.processing : ""}`}
          onMouseDown={isProcessing ? undefined : startRecording}
          onMouseUp={isProcessing ? undefined : stopRecording}
          onTouchStart={isProcessing ? undefined : startRecording}
          onTouchEnd={isProcessing ? undefined : stopRecording}
          disabled={isProcessing}
        >
          {isProcessing ? "⏳" : (isRecording ? "🔴" : "🎤")}
        </button>

        <div className={styles.statusText}>
          {isProcessing 
            ? "Processing your thoughts..." 
            : (isRecording ? "Listening... Release to stop" : "Hold to talk")}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {response && (
        <section className={styles.responseContainer}>
          <div className={styles.responseContent}>
            {response}
          </div>
          <div className={styles.suggestionAction}>
            <p>If you're feeling overwhelmed by what you just shared, we can break it down.</p>
            <button 
              className={styles.chunkBtn}
              onClick={() => router.push('/overwhelmed')}
            >
              Help me break this down
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
