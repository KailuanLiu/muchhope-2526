"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "../components/VolunteerNavbar";
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
  const [collapsed, setCollapsed] = useState(false);
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
    <div className={styles.pageLayout}>
      <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className={`${styles.mainContent} ${collapsed ? styles.mainContentCollapsed : styles.mainContentExpanded}`}>
        <div className={styles.pageWrapper}>
          <section className={styles.heroContainer}>
            <div className={styles.overlay}>
              <h1 className={styles.title}>MuchHope</h1>
              <p className={styles.subtitle}>Providing resources and support for the homeless community in San Jose.</p>
              <Link href="/Auth/Login" className={styles.ctaButton}>
                Volunteer
              </Link>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Upcoming Events</h2>
            <div className={styles.cardGrid}>
              {upcomingEvents.length ? (
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
            <div className={styles.cardGrid}>
              {pastEvents.length ? (
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
      </main>
    </div>
  );
}
