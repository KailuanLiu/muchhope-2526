"use client";

import { useEffect, useState } from "react";
import styles from "../styles/adminShiftViewPopUp.module.css";

interface ShiftRecord {
  _id: string;
  eventId: string;
  volunteerId: string;
  volunteerEmail: string;
  volunteerName: string;
  shiftType: string;
  shiftTime: string;
  date: string;
}

interface EventData {
  id: string;
  title: string;
  date: string;
}

interface AdminShiftViewPopUpProps {
  event: EventData;
  onClose: () => void;
}

export default function AdminShiftViewPopUp({ event, onClose }: AdminShiftViewPopUpProps) {
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShifts() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/shifts?eventId=${encodeURIComponent(event.id)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load shifts");
        setShifts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shifts");
      } finally {
        setIsLoading(false);
      }
    }
    fetchShifts();
  }, [event.id]);

  const handleRemove = async (shiftId: string) => {
    setRemovingId(shiftId);
    try {
      const res = await fetch(`/api/shifts?id=${encodeURIComponent(shiftId)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to remove volunteer");
      }
      setShifts((prev) => prev.filter((s) => s._id !== shiftId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove volunteer");
    } finally {
      setRemovingId(null);
    }
  };

  // Derive shift groups dynamically from actual data — no hardcoded list
  const groupOrder: string[] = [];
  for (const shift of shifts) {
    if (!groupOrder.includes(shift.shiftType)) {
      groupOrder.push(shift.shiftType);
    }
  }

  const grouped = groupOrder.map((type) => ({
    type,
    time: shifts.find((s) => s.shiftType === type)?.shiftTime ?? "",
    volunteers: shifts.filter((s) => s.shiftType === type),
  }));

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.title}>Volunteer Shifts</h2>
        <p className={styles.subtitle}>
          {event.title} &mdash; {event.date}
        </p>

        {isLoading && <p className={styles.loading}>Loading shifts...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!isLoading &&
          !error &&
          (shifts.length === 0 ? (
            <p className={styles.empty}>No volunteers have signed up yet.</p>
          ) : (
            grouped.map(({ type, time, volunteers }) => (
              <div key={type} className={styles.shiftGroup}>
                <div className={styles.shiftGroupHeader}>
                  <h3 className={styles.shiftGroupTitle}>{type}</h3>
                  {time && <span className={styles.shiftGroupTime}>{time}</span>}
                </div>
                {volunteers.length === 0 ? (
                  <p className={styles.noVolunteers}>No volunteers</p>
                ) : (
                  <ul className={styles.volunteerList}>
                    {volunteers.map((shift) => (
                      <li key={shift._id} className={styles.volunteerItem}>
                        <div className={styles.volunteerInfo}>
                          <span className={styles.volunteerName}>{shift.volunteerName}</span>
                          <span className={styles.volunteerEmail}>{shift.volunteerEmail}</span>
                        </div>
                        <button
                          className={styles.removeButton}
                          onClick={() => handleRemove(shift._id)}
                          disabled={removingId === shift._id}
                        >
                          {removingId === shift._id ? "Removing..." : "Remove"}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          ))}
      </div>
    </div>
  );
}
