"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface TempoContextType {
  userName: string;
  setUserName: (name: string) => void;
  ventContext: string;
  setVentContext: (context: string) => void;

  motion: string;
  setMotion: (m: string) => void;
  sound: boolean;
  setSound: (s: boolean) => void;
  contrast: string;
  setContrast: (c: string) => void;
  textSize: number;
  setTextSize: (s: number) => void;
  theme: string;
  setTheme: (t: string) => void;
}

const TempoContext = createContext<TempoContextType | undefined>(undefined);

export function TempoProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState("");
  const [ventContext, setVentContext] = useState("");
  const [motion, setMotion] = useState("full");
  const [sound, setSound] = useState(true);
  const [contrast, setContrast] = useState("standard");
  const [textSize, setTextSize] = useState(0);
  const [theme, setTheme] = useState("light");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem("tempo_userName");
    if (savedName) setUserName(savedName);

    const savedMotion = localStorage.getItem("tempo_motion");
    if (savedMotion) setMotion(savedMotion);

    const savedSound = localStorage.getItem("tempo_sound");
    if (savedSound) setSound(savedSound === "true");

    const savedContrast = localStorage.getItem("tempo_contrast");
    if (savedContrast) setContrast(savedContrast);

    const savedTextSize = localStorage.getItem("tempo_textSize");
    if (savedTextSize) setTextSize(parseInt(savedTextSize));

    const savedTheme = localStorage.getItem("tempo_theme");
    if (savedTheme) setTheme(savedTheme);

    setIsLoaded(true);
  }, []);

  // Save changes & apply them to document only after initial load
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("tempo_userName", userName);
  }, [userName, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("tempo_motion", motion);
    document.documentElement.setAttribute("data-motion", motion);
  }, [motion, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("tempo_sound", sound.toString());
  }, [sound, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("tempo_contrast", contrast);
    document.documentElement.setAttribute("data-contrast", contrast);
  }, [contrast, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("tempo_textSize", textSize.toString());
    document.documentElement.setAttribute("data-textsize", textSize.toString());
  }, [textSize, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("tempo_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, isLoaded]);

  return (
    <TempoContext.Provider value={{
      userName, setUserName,
      ventContext, setVentContext,
      motion, setMotion,
      sound, setSound,
      contrast, setContrast,
      textSize, setTextSize,
      theme, setTheme
    }}>
      {children}
    </TempoContext.Provider>
  );
}

export function useTempo() {
  const context = useContext(TempoContext);
  if (context === undefined) {
    throw new Error("useTempo must be used within a TempoProvider");
  }
  return context;
}
