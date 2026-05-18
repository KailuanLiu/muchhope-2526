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
  return [];
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
          <h1 className={styles.title}>MuchHope</h1>
          <p className={styles.subtitle}>Providing resources and support for the homeless community in San Jose.</p>
          <Link href="/Events/Upcoming" className={styles.ctaButton}>
            Volunteer
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Upcoming Events</h2>
        <div className={styles.cardGrid} aria-busy={isLoading}>
          {isLoading ? (
            loadingSpinner
          ) : upcomingEvents.length ? (
            upcomingEvents.map((event) => (
              <div key={event.id} className={styles.card}>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
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
                <p>{event.description}</p>
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
  );
}
