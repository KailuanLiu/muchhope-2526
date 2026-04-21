"use client";

import styles from "../styles/eventCard.module.css";
import Link from "next/link";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  imageUrl?: string;
  onMoreInfo?: () => void;
  showEditButton?: boolean;
  onEdit?: () => void;
  hideMoreInfo?: boolean;
}

export default function EventCard({
  id,
  title,
  imageUrl,
  onMoreInfo,
  hideMoreInfo,
  showEditButton,
  onEdit,
}: EventCardProps) {
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
        {!hideMoreInfo && (
          <div className={styles.cardActions}>
            <button className={styles.moreInfoButton} onClick={onMoreInfo}>
              More Info &rsaquo;
            </button>
            {showEditButton && (
              <button className={styles.editButton} onClick={onEdit} type="button">
                Edit Event
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
