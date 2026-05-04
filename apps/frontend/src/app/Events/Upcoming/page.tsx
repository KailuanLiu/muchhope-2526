"use client";

//src/app/events/upcoming
import { useEffect, useState } from "react";
import styles from "../../../styles/upcomingEvents.module.css";
import EventCard from "../../../components/EventCard";
import EventInfoPopUp from "../../../components/EventInfoPopUp";
import ShiftSelectionPopUp from "../../../components/ShiftSelectionPopUp";
import AuthLayout from "../../AuthLayout";
import { useIsSuperAdmin } from "../../../../../backend/lib/roles";

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
  // user with vertical AppNavbar const [collapsed, setCollapsed] = useState(false);
  const [collapsed] = useState(false);
  const isMainAdmin = useIsSuperAdmin();
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

      const response = await fetch("/api/events?timeframe=upcoming", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load events.");
      }

      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const handleRegister = () => {
    setModalState("shiftSelect");
  };
  const handleSave = (shiftId: string) => {
    // TODO: wire up to API once backend endpoint is ready
    console.log("Saved shift:", shiftId, "for event:", selectedEvent?.id);
    closeModal();
  };

  const openMoreInfo = (event: EventData) => {
    setSelectedEvent(event);
    setModalState("moreInfo");
  };

  const closeModal = () => {
    setModalState("none");
    setSelectedEvent(null);
  };

  const openCreateForm = () => {
    setEditingEventId(null);
    setFormState(EMPTY_FORM);
    setSaveError("");
    setSaveSuccess("");
    setIsFormOpen(true);
  };

  const openEditForm = (event: EventData) => {
    setEditingEventId(event.id);
    setFormState({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
    });
    setSaveError("");
    setSaveSuccess("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEventId(null);
    setFormState(EMPTY_FORM);
  };

  const updateField = (field: keyof EventFormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess("");

    const url = editingEventId ? `/api/admin/events/${editingEventId}` : "/api/admin/events";
    const method = editingEventId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_name: formState.title,
          date: formState.date,
          time: formState.time,
          location: formState.location,
          description: formState.description,
          volunteers: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to save event.");
      }

      setSaveSuccess(editingEventId ? "Event updated successfully." : "Event created successfully.");
      closeForm();
      await loadEvents();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save event.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Explore Our Upcoming Events!</h1>
      </div>
      <main className={`${styles.mainContent} ${collapsed ? styles.mainContentCollapsed : styles.mainContentExpanded}`}>
        {isMainAdmin ? (
          <div className={styles.adminActions}>
            <button className={styles.adminButton} onClick={openCreateForm} type="button">
              Create Event
            </button>
          </div>
        ) : null}
        {saveSuccess ? <p className={styles.successMessage}>{saveSuccess}</p> : null}
        {isMainAdmin && isFormOpen ? (
          <section className={styles.formSection}>
            <div className={styles.formHeader}>
              <h2>{editingEventId ? "Edit Event" : "Create Event"}</h2>
              <button className={styles.cancelButton} onClick={closeForm} type="button">
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
                value={formState.title}
              />
              <input
                className={styles.formInput}
                onChange={(e) => updateField("date", e.target.value)}
                placeholder="Date"
                required
                type="date"
                value={formState.date}
              />
              <input
                className={styles.formInput}
                onChange={(e) => updateField("time", e.target.value)}
                placeholder="Time"
                required
                type="text"
                value={formState.time}
              />
              <input
                className={styles.formInput}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="Location"
                required
                type="text"
                value={formState.location}
              />
              <textarea
                className={styles.formTextarea}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Description"
                required
                rows={4}
                value={formState.description}
              />
              {saveError ? <p className={styles.errorMessage}>{saveError}</p> : null}
              <button className={styles.adminButton} disabled={isSaving} type="submit">
                {isSaving ? "Saving..." : editingEventId ? "Save Changes" : "Create Event"}
              </button>
            </form>
          </section>
        ) : null}
        <div className={styles.eventGrid}>
          {isLoading ? <p>Loading events...</p> : null}
          {error ? <p>{error}</p> : null}
          {!isLoading && !error
            ? events.map((event) => (
                <EventCard
                  key={event.id}
                  {...event}
                  onMoreInfo={() => openMoreInfo(event)}
                  onEdit={() => openEditForm(event)}
                  showEditButton={isMainAdmin}
                />
              ))
            : null}
        </div>
      </main>

      {modalState === "moreInfo" && selectedEvent && (
        <EventInfoPopUp event={selectedEvent} onClose={closeModal} onRegister={handleRegister} />
      )}

      {modalState === "shiftSelect" && selectedEvent && (
        <ShiftSelectionPopUp event={selectedEvent} onClose={closeModal} onSave={handleSave} />
      )}
    </AuthLayout>
  );
}
