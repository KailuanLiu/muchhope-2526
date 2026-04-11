"use client";

import styles from "../styles/eventCard.module.css";
import Link from "next/link";

interface EventCardProps {
  id: string;
  title: string;
  imageUrl?: string;
}

export default function EventCard({ id, title, imageUrl }: EventCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
        <Link
          href={`/Events/${id}`}
          className={styles.externalIcon}
          aria-label="View event details"
          target="_blank"
          rel="noopener noreferrer"
        >
          &#x2197;
        </Link>
      </div>

      <div className={styles.cardBody}>
        <p className={styles.title}>{title}</p>
        <button className={styles.moreInfoButton}>More Info &rsaquo;</button>
      </div>
    </div>
  );
}
