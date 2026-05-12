"use client";

import styles from "../styles/shiftSelectionPopUp.module.css";
import { useState } from "react";

interface Shift {
  type: string;
  time: string;
}

interface EventData {
  id: string;
  title: string;
  date: string;
}

interface ShiftSelectionPopUpProps {
  event: EventData;
  volunteerId: string;
  volunteerEmail: string;
  onClose: () => void;
  onSave: () => void;
}

const SHIFTS: Shift[] = [
  { type: "Setup", time: "8:00 AM - 10:00 AM" },
  { type: "Cooking", time: "10:00 AM - 12:00 PM" },
  { type: "Serving", time: "12:00 PM - 2:00 PM" },
  { type: "Clean Up", time: "2:00 PM - 4:00 PM" },
];

export default function ShiftSelectionPopUp({
  event,
  volunteerId,
  volunteerEmail,
  onClose,
  onSave,
}: ShiftSelectionPopUpProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!selected) return;
    const shift = SHIFTS.find((s) => s.type === selected);
    if (!shift) return;

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          volunteerId,
          volunteerEmail,
          shiftType: shift.type,
          shiftTime: shift.time,
          date: event.date,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save shift");

      onSave();
    } catch {
      setError("Failed to save shift. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.title}>Choose Your Shift</h2>
        <p>
          {event.title} on {event.date}
        </p>
        <div className={styles.body}>
          <ul className={styles.shiftList}>
            {SHIFTS.map((shift) => (
              <li key={shift.type} className={styles.shiftItem}>
                <div className={styles.shiftInfo}>
                  <span className={styles.shiftType}>{shift.type}</span>
                  <span className={styles.shiftTime}>{shift.time}</span>
                </div>
                <button
                  className={`${styles.selectButton} ${selected === shift.type ? styles.selectButtonActive : ""}`}
                  onClick={() => setSelected(shift.type)}
                >
                  {selected === shift.type ? "Selected" : "Select"}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {error && <p className={styles.errorText}>{error}</p>}
        <button className={styles.primaryButton} onClick={handleSave} disabled={!selected || isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
