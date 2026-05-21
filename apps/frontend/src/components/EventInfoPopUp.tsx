"use client";

import styles from "../styles/eventInfoPopUp.module.css";

interface SubEvent {
  title: string;
  date?: string;
  time?: string;
  location?: string;
  description?: string;
}

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  imageUrl?: string;
  galleryImages?: string[];
  subEvents?: SubEvent[];
}

interface MoreInfoModalProps {
  event: EventData;
  onClose: () => void;
  onRegister: () => void;
}

export default function EventInfoPopUp({ event, onClose, onRegister }: MoreInfoModalProps) {
  const galleryImages = event.galleryImages || [];

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          &times;
        </button>

        <h2 className={styles.title}>{event.title}</h2>

        <div className={styles.body}>
          <div className={styles.imageContainer}>
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.title} className={styles.image} />
            ) : (
              <div className={styles.imagePlaceholder} />
            )}
          </div>

          <div className={styles.info}>
            <div className={styles.metaRow}>
              <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>
                {event.date}
                {event.time ? `, ${event.time}` : ""}
              </span>
            </div>

            <div className={styles.metaRow}>
              <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>{event.location}</span>
            </div>

            <p className={styles.description}>{event.description}</p>

            <button className={styles.registerButton} onClick={onRegister}>
              Register Now
            </button>
          </div>
        </div>

        {event.subEvents && event.subEvents.length > 0 && (
          <>
            <hr className={styles.divider} />
            <div className={styles.subEventsSection}>
              <h3 className={styles.subEventsTitle}>Sub-Events</h3>
              <div className={styles.subEventsList}>
                {event.subEvents.map((sub, index) => (
                  <div key={index} className={styles.subEventItem}>
                    <h4 className={styles.subEventName}>{sub.title}</h4>
                    {(sub.date || sub.time) && (
                      <div className={styles.metaRow}>
                        <svg
                          className={styles.metaIcon}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>{[sub.date, sub.time].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                    {sub.location && (
                      <div className={styles.metaRow}>
                        <svg
                          className={styles.metaIcon}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{sub.location}</span>
                      </div>
                    )}
                    {sub.description && <p className={styles.subEventDescription}>{sub.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {galleryImages.length > 0 && (
          <>
            <hr className={styles.divider} />
            <div className={styles.gallery}>
              <h3 className={styles.galleryTitle}>Photo Gallery</h3>
              <div className={styles.galleryGrid}>
                {galleryImages.map((img, index) => (
                  <div key={index} className={styles.galleryThumbWrapper}>
                    <img src={img} alt={`${event.title} photo ${index + 1}`} className={styles.galleryThumb} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {galleryImages.length === 0 && (
          <>
            <hr className={styles.divider} />
            <div className={styles.gallery}>
              <h3 className={styles.galleryTitle}>Photo Gallery</h3>
              <div className={styles.galleryGrid}>
                {[...Array(6)].map((_, index) => (
                  <div key={index} className={styles.galleryThumbPlaceholder} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
