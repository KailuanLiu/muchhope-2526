"use client";

// src/components/AdminVolunteerPanel.tsx
// Modal panel for admins to view volunteers on an event,
// manually add a volunteer by email, and remove volunteers.

import { useState, useEffect, useCallback } from "react";
import type { EventData, VolunteerData } from "@/components/EventCard";
import styles from "@/styles/adminPanel.module.css";

interface AdminVolunteerPanelProps {
  event: EventData;
  onClose: () => void;
  /** Called after any mutation so the parent can reload the event list */
  onUpdate: () => void;
}

type AddForm = {
  name: string;
  email: string;
  phoneNumber: string;
  isAdult: boolean;
  shiftId: string;
};

const EMPTY_ADD_FORM: AddForm = {
  name: "",
  email: "",
  phoneNumber: "",
  isAdult: true,
  shiftId: "",
};

export default function AdminVolunteerPanel({ event, onClose, onUpdate }: AdminVolunteerPanelProps) {
  const [volunteers, setVolunteers] = useState<VolunteerData[]>(event.volunteers ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<AddForm>(EMPTY_ADD_FORM);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadVolunteers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/events/${event.id}/volunteers`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load volunteers.");
      setVolunteers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load volunteers.");
    } finally {
      setIsLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    loadVolunteers();
  }, [loadVolunteers]);

  const updateAddField = <K extends keyof AddForm>(field: K, value: AddForm[K]) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setAddError("");
    try {
      const res = await fetch(`/api/admin/events/${event.id}/volunteers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add volunteer.");
      setAddForm(EMPTY_ADD_FORM);
      setShowAddForm(false);
      await loadVolunteers();
      onUpdate();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add volunteer.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (volunteerId: string) => {
    setRemovingId(volunteerId);
    try {
      const res = await fetch(`/api/admin/events/${event.id}/volunteers/${volunteerId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove volunteer.");
      }
      await loadVolunteers();
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove volunteer.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>Volunteers</h2>
            <p className={styles.panelSubtitle}>{event.title}</p>
          </div>
          <button className={styles.closeButton} onClick={onClose} type="button" aria-label="Close">
            ×
          </button>
        </div>

        {/* add volunteer button */}
        <div className={styles.panelToolbar}>
          <button className={styles.addButton} onClick={() => setShowAddForm((v) => !v)} type="button">
            {showAddForm ? "Cancel" : "+ Add Volunteer"}
          </button>
        </div>

        {/* add volunteer form */}
        {showAddForm && (
          <form className={styles.addForm} onSubmit={handleAdd}>
            <input
              className={styles.formInput}
              placeholder="Full name"
              required
              type="text"
              value={addForm.name}
              onChange={(e) => updateAddField("name", e.target.value)}
            />
            <input
              className={styles.formInput}
              placeholder="Email"
              required
              type="email"
              value={addForm.email}
              onChange={(e) => updateAddField("email", e.target.value)}
            />
            <input
              className={styles.formInput}
              placeholder="Phone number"
              type="tel"
              value={addForm.phoneNumber}
              onChange={(e) => updateAddField("phoneNumber", e.target.value)}
            />
            {event.shifts && event.shifts.length > 0 && (
              <select
                className={styles.formInput}
                value={addForm.shiftId}
                onChange={(e) => updateAddField("shiftId", e.target.value)}
              >
                <option value="">No shift assigned</option>
                {event.shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.startTime} – {s.endTime})
                  </option>
                ))}
              </select>
            )}
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={addForm.isAdult}
                onChange={(e) => updateAddField("isAdult", e.target.checked)}
              />
              18 or older
            </label>
            {addError && <p className={styles.errorMessage}>{addError}</p>}
            <button className={styles.saveButton} disabled={isAdding} type="submit">
              {isAdding ? "Adding..." : "Add Volunteer"}
            </button>
          </form>
        )}

        {/* volunteer list */}
        <div className={styles.listContainer}>
          {isLoading && <p className={styles.stateMessage}>Loading volunteers...</p>}
          {error && <p className={styles.errorMessage}>{error}</p>}
          {!isLoading && !error && volunteers.length === 0 && (
            <p className={styles.stateMessage}>No volunteers registered yet.</p>
          )}
          {volunteers.map((v) => {
            const assignedShift = event.shifts?.find((s) => s.id === v.shiftId);
            return (
              <div key={v.id} className={styles.listItem}>
                <div className={styles.listItemInfo}>
                  <p className={styles.listItemName}>{v.name}</p>
                  <p className={styles.listItemMeta}>{v.email}</p>
                  {v.phoneNumber && <p className={styles.listItemMeta}>{v.phoneNumber}</p>}
                  {assignedShift && (
                    <p className={styles.listItemMeta}>
                      Shift: {assignedShift.label} ({assignedShift.startTime} – {assignedShift.endTime})
                    </p>
                  )}
                  {!v.isAdult && <span className={styles.minorBadge}>Minor</span>}
                </div>
                <button
                  className={styles.removeButton}
                  disabled={removingId === v.id}
                  onClick={() => handleRemove(v.id)}
                  type="button"
                >
                  {removingId === v.id ? "Removing..." : "Remove"}
                </button>
              </div>
            );
          })}
        </div>

        {/* summary */}
        {volunteers.length > 0 && (
          <p className={styles.panelFooter}>
            {volunteers.length} volunteer{volunteers.length !== 1 ? "s" : ""} registered
          </p>
        )}
      </div>
    </div>
  );
}
