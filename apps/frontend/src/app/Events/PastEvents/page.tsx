"use client";

// src/app/events/pastevents
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthLayout from "../../AuthLayout";
import styles from "../../../styles/pastEvents.module.css";
import EventCard from "../../../components/EventCard";
import EventInfoPopUp from "../../../components/EventInfoPopUp";

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
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

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

  const openDetails = (event: EventData) => {
    setSelectedEvent(event);
  };

  const closeDetails = () => {
    setSelectedEvent(null);
  };

  return (
    <AuthLayout>
      <main className={styles.mainContent}>
        <section className={styles.hero}>
          <div className={styles.breadcrumb}>
            <Link href="/Events/Upcoming" className={styles.breadcrumbLink}>
              My Events
            </Link>
            <span className={styles.breadcrumbSeparator}>&gt;</span>
            <span className={styles.activeBreadcrumb}>Past Events</span>
          </div>
          <h1 className={styles.heroTitle}>Past Events</h1>
          <p className={styles.heroSubtitle}>Look at past events you have volunteered for</p>
        </section>

        {isLoading && <p className={styles.loadingText}>Loading past events...</p>}
        {error && <p className={styles.errorText}>{error}</p>}
        {!isLoading && !error && events.length === 0 && <p className={styles.emptyText}>No past events found.</p>}
        <div className={styles.eventGrid}>
          {events.map((event) => (
            <EventCard key={event.id} {...event} onMoreInfo={() => openDetails(event)} moreInfoLabel="View Details" />
          ))}
        </div>
      </main>

      {selectedEvent && <EventInfoPopUp event={selectedEvent} onClose={closeDetails} onRegister={closeDetails} />}
    </AuthLayout>
  );
}
