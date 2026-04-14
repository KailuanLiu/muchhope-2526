"use client";

import { useEffect, useState } from "react";
import styles from "../styles/viewProfilePopUp.module.css";

interface Volunteer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isAdult: boolean;
  userType: string;
}

interface EventData {
  _id: string;
  event_name: string;
  date: string;
}

interface ViewProfilePopUpProps {
  volunteer: Volunteer;
  onClose: () => void;
}

export default function ViewProfilePopUp({ volunteer, onClose }: ViewProfilePopUpProps) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch(`/api/volunteers/${volunteer.id}/events`);
        if (!res.ok) throw new Error("Failed to fetch events");
        const volunteerEvents: EventData[] = await res.json();
        setEvents(volunteerEvents);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [volunteer.email]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        <h2 className={styles.title}>
          {volunteer.firstName} {volunteer.lastName}
        </h2>

        <div className={styles.section}>
          <div className={styles.field}>
            <span className={styles.label}>First Name</span>
            <span className={styles.value}>{volunteer.firstName}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Last Name</span>
            <span className={styles.value}>{volunteer.lastName}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Email</span>
            <span className={styles.value}>{volunteer.email}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Phone Number</span>
            <span className={styles.value}>{volunteer.phoneNumber}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Age</span>
            <span className={styles.value}>{volunteer.isAdult ? "18+" : "Under 18"}</span>
          </div>
        </div>

        <hr className={styles.divider} />

        <h3 className={styles.sectionTitle}>Events</h3>
        {loading ? (
          <p className={styles.emptyText}>Loading events...</p>
        ) : events.length > 0 ? (
          <ul className={styles.eventList}>
            {events.map((event) => (
              <li key={event._id} className={styles.eventItem}>
                <span className={styles.eventName}>{event.event_name}</span>
                <span className={styles.eventDate}>{event.date}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyText}>No events found.</p>
        )}
      </div>
    </div>
  );
}
