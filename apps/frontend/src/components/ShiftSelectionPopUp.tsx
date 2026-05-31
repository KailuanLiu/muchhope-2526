"use client";

import styles from "../styles/shiftSelectionPopUp.module.css";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

interface Shift {
  id: string;
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
  onClose: () => void;
  onSave: (shiftId: string) => void;
}

const DUMMY_SHIFTS: Shift[] = [
  { id: "s1", type: "Setup", time: "8:00 AM - 10:00 AM" },
  { id: "s2", type: "Cooking", time: "10:00 AM - 12:00 PM" },
  { id: "s3", type: "Serving", time: "12:00 PM - 2:00 PM" },
  { id: "s4", type: "Clean Up", time: "2:00 PM - 4:00 PM" },
];

export default function ShiftSelectionPopUp({ event, onClose, onSave }: ShiftSelectionPopUpProps) {
  const { user } = useUser();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSave = async () => {
    if (!selected) return;

    await fetch("/api/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: event.id,
        shiftId: selected,
        volunteerId: user?.id,
        volunteerEmail: user?.primaryEmailAddress?.emailAddress,
      }),
    });

    onSave(selected);
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
            {DUMMY_SHIFTS.map((shift) => (
              <li key={shift.id} className={styles.shiftItem}>
                <div className={styles.shiftInfo}>
                  <span className={styles.shiftType}>{shift.type}</span>
                  <span className={styles.shiftTime}>{shift.time}</span>
                </div>
                <button
                  className={`${styles.selectButton} ${selected === shift.id ? styles.selectButtonActive : ""}`}
                  onClick={() => setSelected(shift.id)}
                >
                  {selected === shift.id ? "Selected" : "Select"}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button className={styles.primaryButton} onClick={handleSave} disabled={!selected}>
          Save
        </button>
      </div>
    </div>
  );
}
