"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogOut, User } from "lucide-react";
import styles from "./BrandHeader.module.css";
import { logout } from "@/app/login/actions";

export default function BrandHeader() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logoLink}>
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

      <div className={styles.authContainer}>
        {user ? (
          <form action={logout}>
            <button type="submit" className={styles.authBtn}>
              <LogOut size={16} /> Logout
            </button>
          </form>
        ) : (
          <Link href="/login" className={styles.authBtn}>
            <User size={16} /> Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
