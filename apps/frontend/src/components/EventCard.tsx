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
  date,
  time,
  location,
  description,
  imageUrl,
  onMoreInfo,
  hideMoreInfo,
  showEditButton,
  onEdit,
}: EventCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const eventMeta = `${formattedDate} · ${time} · ${location}`;

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
        <p className={styles.meta}>{eventMeta}</p>
        <div className={styles.bottomRow}>
          <div className={styles.copy}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
          </div>
          {!hideMoreInfo && (
            <button className={styles.registerButton} onClick={onMoreInfo} type="button">
              Register
            </button>
          )}
        </div>

        {showEditButton && (
          <button className={styles.editButton} onClick={onEdit} type="button">
            Edit Event
          </button>
        )}
      </div>
    </div>
  );
}
