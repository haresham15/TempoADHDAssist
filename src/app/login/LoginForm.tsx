'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import BrandHeader from '@/components/BrandHeader'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { login } from './actions'

export default function LoginForm() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [loading, setLoading] = useState(false)

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <BrandHeader />
      <div style={{ marginTop: "1rem" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", color: "var(--text-secondary)", textDecoration: "none", gap: "0.5rem" }}>
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: "-10vh" }}>
        <h1 style={{ fontSize: "1.5rem", color: "var(--text-primary)", fontWeight: 500, marginBottom: "1rem" }}>
          Sign In or Sign Up
        </h1>
        <p style={{ color: "var(--text-secondary)", textAlign: "center", maxWidth: "300px", marginBottom: "2rem", lineHeight: 1.5 }}>
          Enter your email to receive a magic login link. No passwords to remember.
        </p>

        <form 
          style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "300px" }}
        >
          <input 
            type="email" 
            name="email" 
            placeholder="Email address" 
            required 
            style={{
              padding: "1rem",
              borderRadius: "16px",
              border: "1px solid var(--border-light)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              fontSize: "1rem",
              outline: "none",
            }}
          />
          <button 
            type="submit" 
            formAction={login}
            onClick={() => setLoading(true)}
            style={{
              padding: "1rem",
              borderRadius: "16px",
              border: "none",
              background: "var(--primary-sage)",
              color: "var(--text-primary)",
              fontWeight: 500,
              fontSize: "1rem",
              cursor: "pointer",
              transition: "transform 0.2s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "2rem", color: "var(--primary-sage)", textAlign: "center", padding: "1rem", background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
