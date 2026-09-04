'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import BrandHeader from '@/components/BrandHeader'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import { login } from './actions'
import styles from './page.module.css'

export default function LoginForm() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [loading, setLoading] = useState(false)

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <BrandHeader />
      <div className={styles.backWrapper}>
        <Link href="/" className={styles.backButton}>
          <ArrowLeft size={18} />
          <span>Back to Tempo</span>
        </Link>
      </div>

      <div className={styles.card}>
        <div className={styles.iconCircle}>
          <Mail size={26} strokeWidth={1.8} />
        </div>
        <h1 className={styles.title}>
          Sign In or Sign Up
        </h1>
        <p className={styles.subtitle}>
          Enter your email to receive a secure, passwordless magic login link.
        </p>

        <form className={styles.form}>
          <input 
            type="email" 
            name="email" 
            placeholder="your.email@example.com" 
            required 
            className={styles.input}
            aria-label="Email address"
          />
          <button 
            type="submit" 
            formAction={login}
            onClick={() => setLoading(true)}
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? "Sending link..." : "Send Magic Link"}
          </button>
        </form>

        {message && (
          <div className={styles.messageBox} role="status">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
