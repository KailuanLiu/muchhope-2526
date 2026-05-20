"use client";

// src/app/events/pastevents
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthLayout from "../../AuthLayout";
import styles from "../../../styles/pastEvents.module.css";
import EventCard from "../../../components/EventCard";

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

export default function PastEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEvents() {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch("/api/events?timeframe=past", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load events");

      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <AuthLayout>
      <div className={styles.pageHeader}>
        <div className={styles.breadcrumb}>
          <Link href="/Events/Upcoming" className={styles.breadcrumbLink}>
            My Events
          </Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <span className={styles.activeBreadcrumb}>Past Events</span>
        </div>
        <h1 className={styles.pageTitle}>Past Events</h1>
      </div>
      <main className={styles.mainContent}>
        {isLoading && <p className={styles.loadingText}>Loading past events...</p>}
        {error && <p className={styles.errorText}>{error}</p>}
        {!isLoading && !error && events.length === 0 && <p className={styles.emptyText}>No past events found.</p>}
        <div className={styles.eventGrid}>
          {events.map((event) => (
            <EventCard key={event.id} {...event} hideMoreInfo />
          ))}
        </div>
      </main>
    </AuthLayout>
  );
}
