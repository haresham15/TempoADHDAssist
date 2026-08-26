"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface TempoContextType {
  userName: string;
  ventContext: string;
  setVentContext: (context: string) => void;
}

const TempoContext = createContext<TempoContextType | undefined>(undefined);

export function TempoProvider({ children }: { children: ReactNode }) {
  const [userName] = useState("Haresh"); // Hardcoded for now per spec
  const [ventContext, setVentContext] = useState("");

  return (
    <TempoContext.Provider value={{ userName, ventContext, setVentContext }}>
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
