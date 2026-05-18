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
    const res = await fetch("http://localhost:3000/api/events", {
      cache: "no-store",
    });

    const data = await res.json();

    return data.map((event: any) => ({
      id: event._id,
      title: event.event_name,
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

  useEffect(() => {
    async function loadEvents() {
      const data = await getEvents();
      setEvents(data);
    }

    loadEvents();
  }, []);

  const now = new Date();

  const upcomingEvents = events.filter((event) => new Date(event.date) >= now);
  const pastEvents = events.filter((event) => new Date(event.date) < now);

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.heroContainer}>
        <div className={styles.overlay}>
          <h1 className={styles.title}>Join us in serving local communities in need!</h1>
          <Link href="/auth/login" className={styles.logoLink}>
            <img src="/color-logo.png" alt="MuchHope" className={styles.logoImage} />
          </Link>
          <Link href="/Events/Upcoming" className={styles.ctaButton}>
            Volunteer
          </Link>
        </div>
      </section>

      <div className={styles.eventsRow}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Upcoming Events</h2>
          <div className={styles.cardGrid}>
            {upcomingEvents.length ? (
              <div key={upcomingEvents[0].id} className={styles.card}>
                <img src="/image2.jpg" alt="event" className={styles.cardImage} />
              </div>
            ) : (
              <p className={styles.emptyMessage}>No upcoming events yet.</p>
            )}
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <h2 className={styles.sectionTitle}>Past Events</h2>
          <div className={styles.cardGrid}>
            {pastEvents.length ? (
              <div key={pastEvents[0].id} className={styles.card}>
                <img src="/image3.jpg" alt="event" className={styles.cardImage} />
              </div>
            ) : (
              <p className={styles.emptyMessage}>No past events yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
