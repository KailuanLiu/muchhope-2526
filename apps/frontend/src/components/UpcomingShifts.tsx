"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/profile.module.css";

interface Shift {
  id: string;
  date: string;
  shiftType: string;
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
        // TODO: Replace with actual API call once backend endpoint is ready
        // const response = await fetch(`/api/shifts?email=${encodeURIComponent(volunteerEmail)}`);
        // const data = await response.json();
        // setShifts(data.shifts);

        // Mock data for development
        setShifts([
          { id: "1", date: "2026-03-15", shiftType: "Food Shift" },
          { id: "2", date: "2026-03-22", shiftType: "Cooking Shift" },
          { id: "3", date: "2026-04-05", shiftType: "Food Shift" },
        ]);
      } catch {
        setError("Failed to load upcoming shifts.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchShifts();
  }, [volunteerEmail]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
            <li key={shift.id} className={styles.shiftItem}>
              <span className={styles.shiftDate}>{formatDate(shift.date)}</span>
              <span className={styles.shiftType}>{shift.shiftType}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
