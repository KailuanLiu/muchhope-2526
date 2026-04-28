"use client";

import { useEffect, useRef, useState } from "react";
import type { Volunteer } from "@/types/volunteer";
import styles from "@/styles/volunteerprofilepopup.module.css";

interface Props {
  volunteer: Volunteer | null;
  mode?: "edit" | "create";
  onClose: () => void;
  onSave: (updated: Volunteer) => void;
  onDelete: (id: string) => void;
}

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

const emptyVolunteer: Volunteer = {
  id: "",
  firstName: "",
  lastName: "",
  role: "Volunteer",
  email: "",
  phoneNumber: "",
  isAdult: undefined,
  age: undefined,
};

export default function VolunteerProfilePopUp({ volunteer, mode = "edit", onClose, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState(mode === "create");
  const [form, setForm] = useState<Volunteer | null>(
    mode === "create" ? { ...emptyVolunteer } : volunteer ? { ...volunteer } : null,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === "create") {
      setForm({ ...emptyVolunteer });
      setEditing(true);
      setConfirmDelete(false);
    } else if (volunteer) {
      setForm({ ...volunteer });
      setEditing(false);
      setConfirmDelete(false);
    } else {
      setForm(null);
      setEditing(false);
      setConfirmDelete(false);
    }
  }, [volunteer, mode]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (mode === "edit" && !volunteer) return null;
  if (!form) return null;

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  function handleChange<K extends keyof Volunteer>(field: K, value: Volunteer[K]) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function handleSave() {
    if (!form) return;

    console.log("Popup saving form:", form);

    onSave(form);

    if (mode !== "create") {
      setEditing(false);
    }
  }

  function handleDelete() {
    if (!volunteer?.id) return;
    onDelete(volunteer.id);
    onClose();
  }

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "create" ? "Add volunteer" : "Volunteer profile"}
    >
      <div className={styles.panel}>
        <div className={styles.topRow}>
          <div className={styles.topLeft}>
            <div className={styles.avatar}>{mode === "create" ? "+" : getInitials(form.firstName, form.lastName)}</div>

            <div className={styles.headerBlock}>
              {editing ? (
                <div className={styles.nameInputs}>
                  <input
                    className={styles.nameInput}
                    value={form.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="First name"
                  />
                  <input
                    className={styles.nameInput}
                    value={form.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              ) : (
                <h2 className={styles.name}>
                  {form.firstName} {form.lastName}
                </h2>
              )}

              <div className={styles.badges}>
                {editing ? (
                  <>
                    <select
                      className={styles.badgeSelect}
                      value={form.role ?? ""}
                      onChange={(e) => handleChange("role", e.target.value)}
                    >
                      <option value="">Select role</option>
                      <option value="Admin">Admin</option>
                      <option value="Volunteer">Volunteer</option>
                    </select>

                    <select
                      className={styles.badgeSelect}
                      value={form.isAdult === undefined ? "" : form.isAdult ? "true" : "false"}
                      onChange={(e) =>
                        handleChange("isAdult", e.target.value === "" ? undefined : e.target.value === "true")
                      }
                    >
                      <option value="">Select age group</option>
                      <option value="true">Adult</option>
                      <option value="false">Minor</option>
                    </select>
                  </>
                ) : (
                  <>
                    <span className={styles.badge}>{form.role || "Unknown"}</span>
                    <span className={styles.badge}>
                      {form.isAdult === undefined ? "Unknown" : form.isAdult ? "Adult" : "Minor"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={styles.topActions}>
            {!editing ? (
              <button type="button" className={styles.editLink} onClick={() => setEditing(true)}>
                ✎ edit
              </button>
            ) : (
              <div className={styles.editingActions}>
                <button type="button" className={styles.saveBtn} onClick={handleSave}>
                  Save
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    if (mode === "create") {
                      onClose();
                    } else {
                      setForm(volunteer ? { ...volunteer } : null);
                      setEditing(false);
                    }
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Email</label>
            {editing ? (
              <input
                className={styles.input}
                value={form.email ?? ""}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email"
              />
            ) : (
              <div className={styles.valueBox}>{form.email || ""}</div>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Phone</label>
            {editing ? (
              <input
                className={styles.input}
                value={form.phoneNumber ?? ""}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder="Enter phone number"
              />
            ) : (
              <div className={styles.valueBox}>{form.phoneNumber || ""}</div>
            )}
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Event Name</label>
            {editing ? (
              <input
                className={styles.input}
                value={form.shiftDetails?.eventName ?? ""}
                onChange={(e) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          shiftDetails: {
                            eventName: e.target.value,
                            shiftType: prev.shiftDetails?.shiftType ?? "",
                            shiftTime: prev.shiftDetails?.shiftTime ?? "",
                          },
                        }
                      : prev,
                  )
                }
                placeholder="Enter event name"
              />
            ) : (
              <div className={styles.valueBox}>{form.shiftDetails?.eventName || ""}</div>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Shift Type</label>
            {editing ? (
              <input
                className={styles.input}
                value={form.shiftDetails?.shiftType ?? ""}
                onChange={(e) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          shiftDetails: {
                            eventName: prev.shiftDetails?.eventName ?? "",
                            shiftType: e.target.value,
                            shiftTime: prev.shiftDetails?.shiftTime ?? "",
                          },
                        }
                      : prev,
                  )
                }
                placeholder="Ex: Check-in, Setup, Cleanup"
              />
            ) : (
              <div className={styles.valueBox}>{form.shiftDetails?.shiftType || ""}</div>
            )}
          </div>
        </div>

        <div className={styles.fullWidthField}>
          <label className={styles.label}>Shift Time</label>
          {editing ? (
            <input
              className={styles.input}
              value={form.shiftDetails?.shiftTime ?? ""}
              onChange={(e) =>
                setForm((prev) =>
                  prev
                    ? {
                        ...prev,
                        shiftDetails: {
                          eventName: prev.shiftDetails?.eventName ?? "",
                          shiftType: prev.shiftDetails?.shiftType ?? "",
                          shiftTime: e.target.value,
                        },
                      }
                    : prev,
                )
              }
              placeholder="Ex: 4:00 PM - 6:00 PM"
            />
          ) : (
            <div className={styles.valueBox}>{form.shiftDetails?.shiftTime || ""}</div>
          )}
        </div>

        <div className={styles.fullWidthField}>
          <label className={styles.label}>Notes</label>
          {editing ? (
            <textarea
              className={styles.textarea}
              value={form.notes ?? ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
              placeholder="Enter notes"
            />
          ) : (
            <div className={styles.textareaBox}>{form.notes || ""}</div>
          )}
        </div>

        <div className={styles.bottomRow}>
          {confirmDelete ? (
            <div className={styles.confirmRow}>
              <span className={styles.confirmText}>Are you sure?</span>
              <button type="button" className={styles.confirmYes} onClick={handleDelete}>
                Yes, Delete
              </button>
              <button type="button" className={styles.confirmNo} onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
            </div>
          ) : mode !== "create" ? (
            <button type="button" className={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>
              Remove Volunteer
            </button>
          ) : (
            <div />
          )}

          <button type="button" className={styles.closeBtnBottom} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
