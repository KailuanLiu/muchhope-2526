"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/profile.module.css";

interface Shift {
  _id: string;
  eventId: string;
  date: string;
  shiftType: string;
  shiftTime: string;
  eventName?: string;
}

interface EventData {
  id: string;
  title: string;
}

interface UpcomingShiftsProps {
  volunteerEmail: string;
}

export default function UpcomingShifts({ volunteerEmail }: UpcomingShiftsProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        // Fetch shifts and events in parallel
        const [shiftsRes, eventsRes] = await Promise.all([
          fetch(`/api/shifts?email=${encodeURIComponent(volunteerEmail)}`),
          fetch("/api/events"),
        ]);

        const shiftsData = await shiftsRes.json();
        const eventsData = await eventsRes.json();

        if (!shiftsRes.ok) throw new Error(shiftsData.message || "Failed to load shifts");

        // Map event names to shifts
        const eventsMap = new Map<string, string>();
        if (Array.isArray(eventsData)) {
          eventsData.forEach((event: EventData) => {
            eventsMap.set(event.id, event.title);
          });
        }

        const enrichedShifts = (Array.isArray(shiftsData) ? shiftsData : []).map((shift: Shift) => ({
          ...shift,
          eventName: eventsMap.get(shift.eventId) || "Unknown Event",
        }));

        setShifts(enrichedShifts);
      } catch {
        setError("Failed to load upcoming shifts.");
      } finally {
        setIsLoading(false);
      }
    };

    if (volunteerEmail) {
      fetchShifts();
    }
  }, [volunteerEmail]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDelete = async (shiftId: string) => {
    try {
      const response = await fetch(`/api/shifts?id=${shiftId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete shift");
      }

      setShifts((prevShifts) => prevShifts.filter((shift) => shift._id !== shiftId));
    } catch {
      setError("Failed to delete shift.");
    }
  };

  return (
    <div className={styles.shiftsCard}>
      <h2 className={styles.sectionTitle}>Upcoming Shifts</h2>

      {isLoading && <p className={styles.loadingText}>Loading shifts...</p>}

      {error && <p className={styles.errorText}>{error}</p>}

      {!isLoading && !error && shifts.length === 0 && <p className={styles.emptyText}>No upcoming shifts scheduled.</p>}

      {!isLoading && !error && shifts.length > 0 && (
        <ul className={styles.shiftList}>
          {shifts.map((shift) => (
            <li key={shift._id} className={styles.shiftItem}>
              <div className={styles.shiftDetails}>
                <span className={styles.shiftEventName}>{shift.eventName}</span>
                <span className={styles.shiftDate}>{formatDate(shift.date)}</span>
                <span className={styles.shiftType}>
                  {shift.shiftType} · {shift.shiftTime}
                </span>
              </div>

              <button className={styles.deleteButton} onClick={() => handleDelete(shift._id)}>
                Cancel
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
