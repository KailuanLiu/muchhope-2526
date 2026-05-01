"use client";

// src/app/events/page.tsx
// Single unified events page. Filter via ?view=upcoming (default) or ?view=past
// Admin controls (create/edit/delete/manage volunteers & shifts) are shown when useIsSuperAdmin() is true.

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthLayout from "@/app/AuthLayout";
import EventCard from "../EventCard";
import EventInfoPopUp from "../EventInfoPopUp";
import ShiftSelectionPopUp from "../ShiftSelectionPopUp";
import AdminEventForm from "@/components/admin/AdminEventForm";
import AdminVolunteerPanel from "@/components/admin/AdminVolunteerPanel";
import AdminShiftPanel from "@/components/admin/AdminShiftPanel";
import ConfirmDeleteModal from "../ConfirmDeleteModal";
import { useIsSuperAdmin } from "@/lib/roles";
import type { EventData } from "../EventCard";
import styles from "@/styles/events.module.css";

type ModalState = "none" | "moreInfo" | "shiftSelect" | "adminVolunteers" | "adminShifts";

export default function EventsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = (searchParams.get("view") ?? "upcoming") as "upcoming" | "past";
  const isAdmin = useIsSuperAdmin();

  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // modal / panel state
  const [modalState, setModalState] = useState<ModalState>("none");
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  // admin form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);

  // delete confirmation
  const [deletingEvent, setDeletingEvent] = useState<EventData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // toast feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await fetch(`/api/events?timeframe=${view}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load events.");
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events.");
    } finally {
      setIsLoading(false);
    }
  }, [view]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const setView = (v: "upcoming" | "past") => {
    router.push(`/events?view=${v}`);
  };

  const openMoreInfo = (event: EventData) => {
    setSelectedEvent(event);
    setModalState("moreInfo");
  };

  const closeModal = () => {
    setModalState("none");
    setSelectedEvent(null);
  };

  const handleRegister = () => setModalState("shiftSelect");

  const handleShiftSave = async (shiftId: string) => {
    if (!selectedEvent) return;
    try {
      const res = await fetch(`/api/events/${selectedEvent.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shiftId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to register for shift.");
      }
      showToast("You're registered!");
      closeModal();
      await loadEvents();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Registration failed.", "error");
    }
  };

  const openCreateForm = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const openEditForm = (event: EventData) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleFormSuccess = async (message: string) => {
    setIsFormOpen(false);
    setEditingEvent(null);
    showToast(message);
    await loadEvents();
  };

  const openDeleteConfirm = (event: EventData) => setDeletingEvent(event);

  const handleDeleteConfirm = async () => {
    if (!deletingEvent) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/events/${deletingEvent.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete event.");
      }
      setDeletingEvent(null);
      showToast("Event deleted.");
      await loadEvents();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete event.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const openVolunteers = (event: EventData) => {
    setSelectedEvent(event);
    setModalState("adminVolunteers");
  };

  const openShifts = (event: EventData) => {
    setSelectedEvent(event);
    setModalState("adminShifts");
  };

  const heroTitle = view === "upcoming" ? "Explore Our Upcoming Events!" : "View Our Past Events!";

  return (
    <AuthLayout>
      {/* hero */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>{heroTitle}</h1>
      </div>

      <main className={styles.mainContent}>
        {/* view toggle */}
        <div className={styles.toggleRow}>
          <button
            className={`${styles.toggleButton} ${view === "upcoming" ? styles.toggleActive : ""}`}
            onClick={() => setView("upcoming")}
            type="button"
          >
            Upcoming
          </button>
          <button
            className={`${styles.toggleButton} ${view === "past" ? styles.toggleActive : ""}`}
            onClick={() => setView("past")}
            type="button"
          >
            Past
          </button>
        </div>

        {/* admin toolbar */}
        {isAdmin && view === "upcoming" && (
          <div className={styles.adminActions}>
            <button className={styles.adminButton} onClick={openCreateForm} type="button">
              + Create Event
            </button>
          </div>
        )}

        {/* toast */}
        {toast && (
          <p className={toast.type === "success" ? styles.successMessage : styles.errorMessage}>{toast.message}</p>
        )}

        {/* inline create/edit form */}
        {isAdmin && isFormOpen && (
          <AdminEventForm
            editingEvent={editingEvent}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingEvent(null);
            }}
          />
        )}

        {/* event grid */}
        <div className={styles.eventGrid}>
          {isLoading && <p className={styles.stateMessage}>Loading events...</p>}
          {error && <p className={styles.errorMessage}>{error}</p>}
          {!isLoading && !error && events.length === 0 && (
            <p className={styles.stateMessage}>No {view} events found.</p>
          )}
          {!isLoading &&
            !error &&
            events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                mode={view}
                isAdmin={isAdmin}
                onMoreInfo={openMoreInfo}
                onEdit={openEditForm}
                onDelete={openDeleteConfirm}
                onManageVolunteers={openVolunteers}
                onManageShifts={openShifts}
              />
            ))}
        </div>
      </main>

      {/* user: more info modal */}
      {modalState === "moreInfo" && selectedEvent && (
        <EventInfoPopUp event={selectedEvent} onClose={closeModal} onRegister={handleRegister} />
      )}

      {/* user: shift selection */}
      {modalState === "shiftSelect" && selectedEvent && (
        <ShiftSelectionPopUp event={selectedEvent} onClose={closeModal} onSave={handleShiftSave} />
      )}

      {/* admin: volunteer panel */}
      {modalState === "adminVolunteers" && selectedEvent && (
        <AdminVolunteerPanel event={selectedEvent} onClose={closeModal} onUpdate={loadEvents} />
      )}

      {/* admin: shift panel */}
      {modalState === "adminShifts" && selectedEvent && (
        <AdminShiftPanel event={selectedEvent} onClose={closeModal} onUpdate={loadEvents} />
      )}

      {/* admin: delete confirm */}
      {deletingEvent && (
        <ConfirmDeleteModal
          title={deletingEvent.title}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingEvent(null)}
        />
      )}
    </AuthLayout>
  );
}
