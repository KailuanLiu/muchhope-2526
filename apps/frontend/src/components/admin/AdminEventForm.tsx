"use client";

// src/components/AdminEventForm.tsx
// Inline form for creating or editing an event.
// Rendered by EventsPage when isFormOpen is true.

import { useState, useEffect } from "react";
import type { EventData } from "@/components/EventCard";
import styles from "@/styles/events.module.css";

type FormState = {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  date: "",
  time: "",
  location: "",
  description: "",
};

interface AdminEventFormProps {
  /** If provided the form is in edit mode; null/undefined = create mode */
  editingEvent: EventData | null;
  onSuccess: (message: string) => void;
  onCancel: () => void;
}

export default function AdminEventForm({ editingEvent, onSuccess, onCancel }: AdminEventFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Populate form when switching to edit mode
  useEffect(() => {
    if (editingEvent) {
      setForm({
        title: editingEvent.title,
        date: editingEvent.date,
        time: editingEvent.time,
        location: editingEvent.location,
        description: editingEvent.description,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setSaveError("");
  }, [editingEvent]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError("");

    const url = editingEvent ? `/api/admin/events/${editingEvent.id}` : "/api/admin/events";
    const method = editingEvent ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: form.title,
          date: form.date,
          time: form.time,
          location: form.location,
          description: form.description,
          volunteers: [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to save event.");

      onSuccess(editingEvent ? "Event updated successfully." : "Event created successfully.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save event.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={styles.formSection}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>{editingEvent ? "Edit Event" : "Create Event"}</h2>
        <button className={styles.cancelButton} onClick={onCancel} type="button">
          Cancel
        </button>
      </div>

      <form className={styles.eventForm} onSubmit={handleSubmit}>
        <input
          className={styles.formInput}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Event title"
          required
          type="text"
          value={form.title}
        />
        <div className={styles.formRow}>
          <input
            className={styles.formInput}
            onChange={(e) => updateField("date", e.target.value)}
            required
            type="date"
            value={form.date}
          />
          <input
            className={styles.formInput}
            onChange={(e) => updateField("time", e.target.value)}
            placeholder="e.g. 9:00 AM - 12:00 PM"
            required
            type="text"
            value={form.time}
          />
        </div>
        <input
          className={styles.formInput}
          onChange={(e) => updateField("location", e.target.value)}
          placeholder="Location"
          required
          type="text"
          value={form.location}
        />
        <textarea
          className={styles.formTextarea}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Description"
          required
          rows={4}
          value={form.description}
        />

        {saveError && <p className={styles.errorMessage}>{saveError}</p>}

        <button className={styles.adminButton} disabled={isSaving} type="submit">
          {isSaving ? "Saving..." : editingEvent ? "Save Changes" : "Create Event"}
        </button>
      </form>
    </section>
  );
}
