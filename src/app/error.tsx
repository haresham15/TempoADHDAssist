"use client";

import { useEffect } from "react";
import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error:", error);
  }, [error]);

  return (
    <main className="page-container" style={{ padding: "1.5rem", maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <BrandHeader />
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: "1.5rem", marginTop: "-10vh" }}>
        <h1 style={{ fontSize: "1.5rem", color: "var(--text-primary)", fontWeight: 500 }}>
          Something didn't quite work.
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.5, maxWidth: "400px" }}>
          We hit a snag processing that. It's completely okay—take a breath, and we can try again when you're ready.
        </p>
        
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button 
            onClick={() => reset()}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "999px",
              border: "none",
              background: "var(--primary-sage)",
              color: "var(--text-primary)",
              fontWeight: 500,
              cursor: "pointer",
              transition: "transform 0.2s"
            }}
          >
            Try Again
          </button>
          
          <Link href="/">
            <button 
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "999px",
                border: "2px solid var(--border-light)",
                background: "transparent",
                color: "var(--text-primary)",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.2s"
              }}
            >
              Go Home
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
