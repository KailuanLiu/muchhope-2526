"use client";

import { useEffect, useState } from "react";
import styles from "../../../styles/upcomingEvents.module.css";
import EventCard from "../../../components/EventCard";
import EventInfoPopUp from "../../../components/EventInfoPopUp";
import ShiftSelectionPopUp from "../../../components/ShiftSelectionPopUp";
import AuthLayout from "../../AuthLayout";
import { useIsSuperAdmin } from "../../../lib/roles";

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

type ModalState = "none" | "moreInfo" | "shiftSelect";

export default function UpcomingEventsPage() {
  // user with vertical AppNavbar const [collapsed, setCollapsed] = useState(false);
  const [collapsed] = useState(false);
  const isMainAdmin = useIsSuperAdmin();
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalState, setModalState] = useState<ModalState>("none");
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/events?timeframe=upcoming", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load events.");
        }

        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events.");
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();
  }, []);

  const handleRegister = () => {
    setModalState("shiftSelect");
  };
  const handleSave = (shiftId: string) => {
    // TODO: wire up to API once backend endpoint is ready
    console.log("Saved shift:", shiftId, "for event:", selectedEvent?.id);
    closeModal();
  };

  const openMoreInfo = (event: EventData) => {
    setSelectedEvent(event);
    setModalState("moreInfo");
  };

  const closeModal = () => {
    setModalState("none");
    setSelectedEvent(null);
  };

  return (
    <AuthLayout>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Explore Our Upcoming Events!</h1>
      </div>
      <main className={`${styles.mainContent} ${collapsed ? styles.mainContentCollapsed : styles.mainContentExpanded}`}>
        {isMainAdmin ? (
          <div className={styles.adminActions}>
            <button className={styles.adminButton} type="button">
              Create Event
            </button>
          </div>
        ) : null}
        <div className={styles.eventGrid}>
          {isLoading ? <p>Loading events...</p> : null}
          {error ? <p>{error}</p> : null}
          {!isLoading && !error
            ? events.map((event) => (
                <EventCard
                  key={event.id}
                  {...event}
                  onMoreInfo={() => openMoreInfo(event)}
                  onEdit={() => {}}
                  showEditButton={isMainAdmin}
                />
              ))
            : null}
        </div>
      </main>

      {modalState === "moreInfo" && selectedEvent && (
        <EventInfoPopUp event={selectedEvent} onClose={closeModal} onRegister={handleRegister} />
      )}

      {modalState === "shiftSelect" && selectedEvent && (
        <ShiftSelectionPopUp event={selectedEvent} onClose={closeModal} onSave={handleSave} />
      )}
    </AuthLayout>
  );
}
