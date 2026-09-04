"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { LogOut, User as UserIcon, Sparkles } from "lucide-react";
import styles from "./BrandHeader.module.css";
import { logout } from "@/app/login/actions";
import PricingModal from "./PricingModal";

export default function BrandHeader() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [isPlus, setIsPlus] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    const checkPlus = () => {
      if (typeof window !== "undefined") {
        setIsPlus(localStorage.getItem("tempo_plus_active") === "true");
      }
    };
    checkPlus();
    window.addEventListener("tempo_plus_change", checkPlus);

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener("tempo_plus_change", checkPlus);
    };
  }, []);

  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.logoLink} aria-label="Tempo home">
          <div className={styles.imageWrapper}>
            <Image 
              src="/icon.png" 
              alt="Tempo Logo" 
              width={32} 
              height={32} 
              className={styles.logoImage}
              priority
            />
          </div>
          <span className={styles.brandName}>Tempo</span>
        </Link>

        <div className={styles.headerActions}>
          <Link href="/about" className={styles.navLink} title="About Tempo &amp; FAQ">
            About
          </Link>

          <button 
            type="button" 
            className={styles.plusBadgeBtn}
            onClick={() => setShowPricing(true)}
            title="View Tempo Plans"
          >
            <Sparkles size={12} strokeWidth={2.5} />
            <span>{isPlus ? "Tempo Plus" : "Plans"}</span>
          </button>

          <div className={styles.authContainer}>
            {user ? (
              <>
                <span className={styles.userEmail} title={user.email || ""}>
                  {user.email?.split("@")[0]}
                </span>
                <form action={logout}>
                  <button type="submit" className={styles.authBtn} title="Sign out">
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className={styles.authBtn}>
                <UserIcon size={14} />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <PricingModal 
        isOpen={showPricing} 
        onClose={() => setShowPricing(false)} 
      />
    </>
  );
}
