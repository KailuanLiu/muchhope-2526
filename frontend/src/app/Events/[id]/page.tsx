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
};

export default function EventDetailPage() {
  // use with vertical AppNavbar const [collapsed, setCollapsed] = useState(false);
  const [collapsed] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

        const matchedEvent = Array.isArray(data) ? data.find((item) => item.id === id) : null;
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

  return (
    <div className={styles.pageLayout}>
      {/*use with vertical AppNavbar <Navbar collapsed={collapsed} setCollapsed={setCollapsed} /> */}
      <Navbar />
      <main className={`${styles.mainContent} ${collapsed ? styles.mainContentCollapsed : styles.mainContentExpanded}`}>
        {isLoading ? (
          <p className={styles.notFound}>Loading event...</p>
        ) : error ? (
          <p className={styles.notFound}>{error}</p>
        ) : event ? (
          <>
            <h1 className={styles.title}>{event.title}</h1>
            <div className={styles.body}>
              <div className={styles.imagePlaceholder} />
              <div className={styles.info}>
                <p className={styles.meta}>
                  {event.date} &middot; {event.time}
                </p>
                <p className={styles.meta}>{event.location}</p>
                <p className={styles.description}>{event.description}</p>
              </div>
            </div>
          </>
        ) : (
          <p className={styles.notFound}>Event {id} not found.</p>
        )}
      </main>
    </div>
  );
}
