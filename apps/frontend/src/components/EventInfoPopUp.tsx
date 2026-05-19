"use client";

import styles from "../styles/eventInfoPopUp.module.css";

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  imageUrl?: string;
  photos?: string[];
}

interface MoreInfoModalProps {
  event: EventData;
  onClose: () => void;
  onRegister: () => void;
}

const CalendarIcon = () => (
  <svg
    aria-hidden="true"
    className={styles.metaIcon}
    fill="none"
    height="18"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="18"
  >
    <rect height="16" rx="2" width="18" x="3" y="5" />
    <line x1="3" x2="21" y1="10" y2="10" />
    <line x1="8" x2="8" y1="3" y2="7" />
    <line x1="16" x2="16" y1="3" y2="7" />
  </svg>
);

const LocationIcon = () => (
  <svg
    aria-hidden="true"
    className={styles.metaIcon}
    fill="none"
    height="18"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="18"
  >
    <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

export default function EventInfoPopUp({ event, onClose, onRegister }: MoreInfoModalProps) {
  const galleryItems =
    event.photos && event.photos.length > 0 ? event.photos.slice(0, 6) : Array<string | undefined>(6).fill(undefined);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button aria-label="Close" className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.title}>{event.title}</h2>

        <div className={styles.body}>
          <div className={styles.imageWrapper}>
            {event.imageUrl ? (
              <img alt={event.title} className={styles.image} src={event.imageUrl} />
            ) : (
              <div className={styles.imagePlaceholder} />
            )}
          </div>

          <div className={styles.info}>
            <div className={styles.metaRow}>
              <CalendarIcon />
              <span>
                {event.date}
                {event.time ? `, ${event.time}` : ""}
              </span>
            </div>
            <div className={styles.metaRow}>
              <LocationIcon />
              <span>{event.location}</span>
            </div>
            <p className={styles.description}>{event.description}</p>
            <button className={styles.registerButton} onClick={onRegister} type="button">
              Register Now
            </button>
          </div>
        </div>

        <hr className={styles.divider} />

        <section className={styles.gallery}>
          <p className={styles.galleryTitle}>Photo Gallery</p>
          <div className={styles.galleryGrid}>
            {galleryItems.map((src, i) =>
              src ? (
                <img alt="" className={styles.galleryThumb} key={i} src={src} />
              ) : (
                <div className={styles.galleryThumb} key={i} />
              ),
            )}
          </div>
        </section>

        <hr className={styles.divider} />
      </div>
    </div>
  );
}
