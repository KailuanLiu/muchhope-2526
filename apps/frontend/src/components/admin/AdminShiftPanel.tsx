"use client";

// src/components/AdminShiftPanel.tsx
// Modal panel for admins to create, edit, and delete shifts on an event.

import { useState, useEffect, useCallback } from "react";
import type { EventData, ShiftData } from "@/components/EventCard";
import styles from "@/styles/adminPanel.module.css";

interface AdminShiftPanelProps {
  event: EventData;
  onClose: () => void;
  onUpdate: () => void;
}

type ShiftForm = {
  label: string;
  startTime: string;
  endTime: string;
  capacity: string;
};

const EMPTY_SHIFT_FORM: ShiftForm = {
  label: "",
  startTime: "",
  endTime: "",
  capacity: "10",
};

export default function AdminShiftPanel({ event, onClose, onUpdate }: AdminShiftPanelProps) {
  const [shifts, setShifts] = useState<ShiftData[]>(event.shifts ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // create / edit form
  const [editingShift, setEditingShift] = useState<ShiftData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ShiftForm>(EMPTY_SHIFT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadShifts = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/events/${event.id}/shifts`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load shifts.");
      setShifts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shifts.");
    } finally {
      setIsLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const openCreate = () => {
    setEditingShift(null);
    setForm(EMPTY_SHIFT_FORM);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (shift: ShiftData) => {
    setEditingShift(shift);
    setForm({
      label: shift.label,
      startTime: shift.startTime,
      endTime: shift.endTime,
      capacity: String(shift.capacity),
    });
    setFormError("");
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingShift(null);
    setForm(EMPTY_SHIFT_FORM);
  };

  const updateField = (field: keyof ShiftForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError("");

    const url = editingShift
      ? `/api/admin/events/${event.id}/shifts/${editingShift.id}`
      : `/api/admin/events/${event.id}/shifts`;
    const method = editingShift ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: form.label,
          startTime: form.startTime,
          endTime: form.endTime,
          capacity: parseInt(form.capacity, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save shift.");
      cancelForm();
      await loadShifts();
      onUpdate();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save shift.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (shiftId: string) => {
    setDeletingId(shiftId);
    try {
      const res = await fetch(`/api/admin/events/${event.id}/shifts/${shiftId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete shift.");
      }
      await loadShifts();
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete shift.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>Shifts</h2>
            <p className={styles.panelSubtitle}>{event.title}</p>
          </div>
          <button className={styles.closeButton} onClick={onClose} type="button" aria-label="Close">
            ×
          </button>
        </div>

        {/* toolbar */}
        <div className={styles.panelToolbar}>
          {!showForm && (
            <button className={styles.addButton} onClick={openCreate} type="button">
              + Add Shift
            </button>
          )}
        </div>

        {/* create / edit form */}
        {showForm && (
          <form className={styles.addForm} onSubmit={handleSubmit}>
            <input
              className={styles.formInput}
              placeholder='Shift label (e.g. "Morning")'
              required
              type="text"
              value={form.label}
              onChange={(e) => updateField("label", e.target.value)}
            />
            <div className={styles.formRow}>
              <label className={styles.fieldLabel}>
                Start time
                <input
                  className={styles.formInput}
                  required
                  type="time"
                  value={form.startTime}
                  onChange={(e) => updateField("startTime", e.target.value)}
                />
              </label>
              <label className={styles.fieldLabel}>
                End time
                <input
                  className={styles.formInput}
                  required
                  type="time"
                  value={form.endTime}
                  onChange={(e) => updateField("endTime", e.target.value)}
                />
              </label>
            </div>
            <label className={styles.fieldLabel}>
              Capacity
              <input
                className={styles.formInput}
                min={1}
                required
                type="number"
                value={form.capacity}
                onChange={(e) => updateField("capacity", e.target.value)}
              />
            </label>
            {formError && <p className={styles.errorMessage}>{formError}</p>}
            <div className={styles.formActions}>
              <button className={styles.saveButton} disabled={isSaving} type="submit">
                {isSaving ? "Saving..." : editingShift ? "Save Changes" : "Create Shift"}
              </button>
              <button className={styles.cancelButton} onClick={cancelForm} type="button">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* shift list */}
        <div className={styles.listContainer}>
          {isLoading && <p className={styles.stateMessage}>Loading shifts...</p>}
          {error && <p className={styles.errorMessage}>{error}</p>}
          {!isLoading && !error && shifts.length === 0 && <p className={styles.stateMessage}>No shifts created yet.</p>}
          {shifts.map((shift) => {
            const spotsLeft = shift.capacity - shift.enrolled;
            return (
              <div key={shift.id} className={styles.listItem}>
                <div className={styles.listItemInfo}>
                  <p className={styles.listItemName}>{shift.label}</p>
                  <p className={styles.listItemMeta}>
                    {shift.startTime} – {shift.endTime}
                  </p>
                  <p className={styles.listItemMeta}>
                    {shift.enrolled} / {shift.capacity} filled
                    {spotsLeft <= 0 && <span className={styles.fullBadge}> Full</span>}
                  </p>
                </div>
                <div className={styles.listItemActions}>
                  <button className={styles.editButton} onClick={() => openEdit(shift)} type="button">
                    Edit
                  </button>
                  <button
                    className={styles.removeButton}
                    disabled={deletingId === shift.id}
                    onClick={() => handleDelete(shift.id)}
                    type="button"
                  >
                    {deletingId === shift.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {shifts.length > 0 && (
          <p className={styles.panelFooter}>
            {shifts.length} shift{shifts.length !== 1 ? "s" : ""} &middot;{" "}
            {shifts.reduce((sum, s) => sum + s.enrolled, 0)} total volunteers
          </p>
        )}
      </div>
    </div>
  );
}
