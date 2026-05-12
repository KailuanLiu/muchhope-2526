"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/profile.module.css";

interface Shift {
  _id: string;
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
        const response = await fetch(`/api/shifts?email=${encodeURIComponent(volunteerEmail)}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load shifts");
        setShifts(data);
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
            <li key={shift._id} className={styles.shiftItem}>
              <span className={styles.shiftDate}>{formatDate(shift.date)}</span>
              <span className={styles.shiftType}>{shift.shiftType}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
