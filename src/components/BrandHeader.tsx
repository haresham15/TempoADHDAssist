import Image from "next/image";
import Link from "next/link";
import styles from "./BrandHeader.module.css";

export default function BrandHeader() {
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
    </header>
  );
}
