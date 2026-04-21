"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import PastEvent from "../../components/PastEvents";
import styles from "../../styles/pastEvents.module.css";

type PastEventData = {
  id: string;
  name: string;
  image: string;
  desc: string;
};

export default function PastEvents() {
  const [events, setEvents] = useState<PastEventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/events?timeframe=past", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load past events.");
        }

        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load past events.");
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <main>
      <Navbar />
      <div className={styles.pastEventsContainer}>
        <img src="/placeholder.jpg" alt="banner" className={styles.pastEventBanner} />
        <h1 className={styles.pastEventsView}> View Our Past Events! </h1>
      </div>

      <div className={styles.pastEventsList}>
        {isLoading ? <p>Loading past events...</p> : null}
        {error ? <p>{error}</p> : null}
        {!isLoading && !error ? events.map((event) => <PastEvent key={event.id} event={event} />) : null}
      </div>
    </main>
  );
}
