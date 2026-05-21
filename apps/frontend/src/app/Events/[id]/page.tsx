// app/Events/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "../../../styles/eventDetail.module.css";
import Navbar from "../../../components/Navbar";

type EventData = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  imageUrl?: string;
  galleryImages?: string[];
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadEvent() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/events", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load event.");
        }

        const matchedEvent = Array.isArray(data) ? data.find((item: EventData) => item.id === id) : null;
        setEvent(matchedEvent || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event.");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadEvent();
    }
  }, [id]);

  const galleryImages = event?.galleryImages || [];

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = () => {
    if (lightboxIndex !== null && galleryImages.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % galleryImages.length);
    }
  };

  const goPrev = () => {
    if (lightboxIndex !== null && galleryImages.length > 0) {
      setLightboxIndex((lightboxIndex - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  return (
    <div className={styles.pageLayout}>
      <Navbar />
      <main className={styles.mainContent}>
        {isLoading ? (
          <p className={styles.notFound}>Loading event...</p>
        ) : error ? (
          <p className={styles.notFound}>{error}</p>
        ) : event ? (
          <div className={styles.container}>
            <h1 className={styles.title}>{event.title}</h1>

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
                  <span>
                    {event.date}
                    {event.time ? ` · ${event.time}` : ""}
                  </span>
                </div>

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
                  <span>{event.location}</span>
                </div>

                <p className={styles.description}>{event.description}</p>
              </div>
            </div>

            <hr className={styles.divider} />

            <section className={styles.gallery}>
              <h2 className={styles.galleryTitle}>Photo Gallery</h2>
              {galleryImages.length > 0 ? (
                <div className={styles.galleryGrid}>
                  {galleryImages.map((img, index) => (
                    <button
                      key={index}
                      className={styles.galleryThumbButton}
                      onClick={() => openLightbox(index)}
                      aria-label={`View photo ${index + 1}`}
                    >
                      <img src={img} alt={`${event.title} photo ${index + 1}`} className={styles.galleryThumbImg} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.galleryGrid}>
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className={styles.galleryThumbPlaceholder} />
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <p className={styles.notFound}>Event not found.</p>
        )}

        {lightboxIndex !== null && galleryImages.length > 0 && (
          <div className={styles.lightboxOverlay} onClick={closeLightbox}>
            <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.lightboxClose} onClick={closeLightbox} aria-label="Close gallery">
                &times;
              </button>
              <button className={styles.lightboxPrev} onClick={goPrev} aria-label="Previous photo">
                &#8249;
              </button>
              <img
                src={galleryImages[lightboxIndex]}
                alt={`${event?.title} photo ${lightboxIndex + 1}`}
                className={styles.lightboxImage}
              />
              <button className={styles.lightboxNext} onClick={goNext} aria-label="Next photo">
                &#8250;
              </button>
              <p className={styles.lightboxCounter}>
                {lightboxIndex + 1} / {galleryImages.length}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
