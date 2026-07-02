"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../styles/landingPage.module.css";

type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string | Date;
};

async function getEvents(): Promise<Event[]> {
  try {
    const res = await fetch("/api/events", {
      cache: "no-store",
    });

    const data = await res.json();

    return data.map((event: any) => ({
      id: event.id ?? event._id,
      title: event.title ?? event.event_name,
      description: event.description,
      location: event.location,
      date: event.date,
    }));
  } catch {
    return [];
  }
}

export default function LandingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getEvents();
        setEvents(data);
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();
  }, []);

  const now = new Date();

  const upcomingEvents = events.filter((event) => new Date(event.date) >= now);
  const pastEvents = events.filter((event) => new Date(event.date) < now);

  const loadingSpinner = (
    <div className={styles.loadingWrapper} role="status" aria-label="Loading events">
      <div className={styles.spinner} aria-hidden="true" />
    </div>
  );

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.heroContainer}>
        <div className={styles.overlay}>
          <Link href="/" className={styles.logoLink}>
            <img src="/white-logo.png" alt="Much Hope" className={styles.logoImage} />
          </Link>
          <h1 className={styles.title}>Join us in serving local communities in need!</h1>
          <p className={styles.subtitle}>Providing resources and support for the homeless community in San Jose.</p>
          <Link href="/Events/Upcoming" className={styles.ctaButton}>
            Volunteer
          </Link>
        </div>
      </section>

      <div className={styles.eventsRow}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Upcoming Events</h2>
          <div className={styles.cardGrid} aria-busy={isLoading}>
            {isLoading ? (
              loadingSpinner
            ) : upcomingEvents.length ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className={styles.card}>
                  <h3>{event.title}</h3>
                  <p className={styles.cardDescription}>{event.description}</p>
                  <p>{event.location}</p>
                  <p>{new Date(event.date).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p className={styles.emptyMessage}>No upcoming events yet.</p>
            )}
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <h2 className={styles.sectionTitle}>Past Events</h2>
          <div className={styles.cardGrid} aria-busy={isLoading}>
            {isLoading ? (
              loadingSpinner
            ) : pastEvents.length ? (
              pastEvents.map((event) => (
                <div key={event.id} className={styles.card}>
                  <h3>{event.title}</h3>
                  <p className={styles.cardDescription}>{event.description}</p>
                  <p>{event.location}</p>
                  <p>{new Date(event.date).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p className={styles.emptyMessage}>No past events yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
