"use client";

// src/components/EventCard.tsx
import Link from "next/link";
import styles from "../styles/eventCard.module.css";

export interface ShiftData {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  capacity: number;
  enrolled: number;
}

export interface VolunteerData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isAdult: boolean;
  shiftId?: string;
}

export interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  imageUrl?: string;
  shifts?: ShiftData[];
  volunteers?: VolunteerData[];
}

interface EventCardProps {
  event: EventData;
  /** "upcoming" shows More Info; "past" is read-only */
  mode: "upcoming" | "past";
  isAdmin?: boolean;
  onMoreInfo?: (event: EventData) => void;
  onEdit?: (event: EventData) => void;
  onDelete?: (event: EventData) => void;
  onManageVolunteers?: (event: EventData) => void;
  onManageShifts?: (event: EventData) => void;
}

export default function EventCard({
  event,
  mode,
  isAdmin,
  onMoreInfo,
  onEdit,
  onDelete,
  onManageVolunteers,
  onManageShifts,
}: EventCardProps) {
  const isPast = mode === "past";

  return (
    <div className={`${styles.card} ${isPast ? styles.cardPast : ""}`}>
      <div className={styles.imageWrapper}>
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
        <Link
          href={`/events/${event.id}`}
          className={styles.externalIcon}
          aria-label="View event details"
          target="_blank"
          rel="noopener noreferrer"
        >
          &#x2197;
        </Link>
        {isPast && <span className={styles.pastBadge}>Past</span>}
      </div>

      <div className={styles.cardBody}>
        <p className={styles.title}>{event.title}</p>
        <p className={styles.meta}>
          {event.date} &middot; {event.time}
        </p>
        <p className={styles.location}>{event.location}</p>

        <div className={styles.cardActions}>
          {!isPast && onMoreInfo && (
            <button className={styles.moreInfoButton} onClick={() => onMoreInfo(event)} type="button">
              More Info &rsaquo;
            </button>
          )}

          {isAdmin && (
            <div className={styles.adminActions}>
              <button className={styles.editButton} onClick={() => onEdit?.(event)} type="button">
                Edit
              </button>
              <button className={styles.manageButton} onClick={() => onManageShifts?.(event)} type="button">
                Shifts
              </button>
              <button className={styles.manageButton} onClick={() => onManageVolunteers?.(event)} type="button">
                Volunteers
              </button>
              <button className={styles.deleteButton} onClick={() => onDelete?.(event)} type="button">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
