"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import styles from "../../../styles/upcomingEvents.module.css";
import EventCard from "../../../components/EventCard";
import EventInfoPopUp from "../../../components/EventInfoPopUp";
import ShiftSelectionPopUp from "../../../components/ShiftSelectionPopUp";
import AuthLayout from "../../AuthLayout";
import { useIsSuperAdmin } from "../../../../lib/roles";

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

type ModalState = "none" | "moreInfo" | "shiftSelect";

type EventFormState = {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
};

const EMPTY_FORM: EventFormState = {
  title: "",
  date: "",
  time: "",
  location: "",
  description: "",
};

export default function UpcomingEventsPage() {
  const isMainAdmin = useIsSuperAdmin();
  const { user } = useUser();
  const volunteerId = user?.id ?? "";
  const volunteerEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalState, setModalState] = useState<ModalState>("none");
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [formState, setFormState] = useState<EventFormState>(EMPTY_FORM);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  async function loadEvents() {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch("/api/events?timeframe=upcoming", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load events");

      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const openMoreInfo = (event: EventData) => {
    setSelectedEvent(event);
    setModalState("moreInfo");
  };

  const closeModal = () => {
    setModalState("none");
    setSelectedEvent(null);
  };

  const handleRegister = () => {
    setModalState("shiftSelect");
  };

  const handleSaveShift = () => {
    closeModal();
  };

  const openCreateForm = () => {
    if (!isMainAdmin) return;

    setEditingEventId(null);
    setFormState(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEditForm = (event: EventData) => {
    if (!isMainAdmin) return;

    setEditingEventId(event.id);
    setFormState({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
    });

    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEventId(null);
    setFormState(EMPTY_FORM);
  };

  const updateField = (field: keyof EventFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess("");

    const url = editingEventId ? `/api/admin/events/${editingEventId}` : "/api/admin/events";

    const method = editingEventId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: formState.title,
          date: formState.date,
          time: formState.time,
          location: formState.location,
          description: formState.description,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save event");

      setSaveSuccess(editingEventId ? "Event updated" : "Event created");

      closeForm();
      await loadEvents();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.pageHeader}>
        <div className={styles.breadcrumb}>
          <span className={styles.breadcrumbLink}>My Events</span>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <span className={styles.activeBreadcrumb}>Upcoming Events</span>
        </div>
        <h1 className={styles.pageTitle}>Upcoming Events</h1>
      </div>
      <main className={styles.mainContent}>
        {isMainAdmin && (
          <div className={styles.adminActions}>
            <button className={styles.adminButton} onClick={openCreateForm}>
              Create Event
            </button>
          </div>
        )}

        {saveSuccess && <p className={styles.successMessage}>{saveSuccess}</p>}

        <div className={styles.eventGrid}>
          {isLoading && <p>Loading events...</p>}
          {error && <p>{error}</p>}

          {!isLoading &&
            !error &&
            events.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                onMoreInfo={() => openMoreInfo(event)}
                onEdit={() => openEditForm(event)}
                showEditButton={isMainAdmin}
              />
            ))}
        </div>
      </main>

      {isMainAdmin && isFormOpen && (
        <div className={styles.overlay}>
          <div className={styles.panel}>
            <div className={styles.formHeader}>
              <h2>{editingEventId ? "Edit Event" : "Create Event"}</h2>

              <button onClick={closeForm} className={styles.cancelButton}>
                Cancel
              </button>
            </div>

            <form className={styles.eventForm} onSubmit={handleSubmit}>
              <input
                className={styles.formInput}
                placeholder="Title"
                value={formState.title}
                onChange={(e) => updateField("title", e.target.value)}
              />

              <input
                className={styles.formInput}
                type="date"
                value={formState.date}
                onChange={(e) => updateField("date", e.target.value)}
              />

              <div className={styles.timeRow}>
                <input
                  className={styles.formInput}
                  type="text"
                  placeholder="Time"
                  value={formState.time}
                  onChange={(e) => updateField("time", e.target.value)}
                />
              </div>

              <input
                className={styles.formInput}
                placeholder="Location"
                value={formState.location}
                onChange={(e) => updateField("location", e.target.value)}
              />

              <textarea
                className={styles.formTextarea}
                placeholder="Description"
                value={formState.description}
                onChange={(e) => updateField("description", e.target.value)}
              />

              {saveError && <p className={styles.errorMessage}>{saveError}</p>}

              <button className={styles.adminButton} disabled={isSaving}>
                {isSaving ? "Saving..." : editingEventId ? "Save Changes" : "Create Event"}
              </button>
            </form>
          </div>
        </div>
      )}

      {modalState === "moreInfo" && selectedEvent && (
        <EventInfoPopUp event={selectedEvent} onClose={closeModal} onRegister={handleRegister} />
      )}

      {modalState === "shiftSelect" && selectedEvent && (
        <ShiftSelectionPopUp
          event={selectedEvent}
          volunteerId={volunteerId}
          volunteerEmail={volunteerEmail}
          onClose={closeModal}
          onSave={handleSaveShift}
        />
      )}
    </AuthLayout>
  );
}
