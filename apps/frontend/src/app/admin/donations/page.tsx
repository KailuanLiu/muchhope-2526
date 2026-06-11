"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthLayout from "@/app/AuthLayout";
import styles from "@/styles/adminDonations.module.css";

type DonationRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  clerkId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  provisions: string;
  quantity: number;
  photoName: string;
  photoType: string;
  photoDataUrl: string;
  createdAt?: string;
};

type SortMode = "event" | "newest";

type EventFilterOption = {
  value: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  label: string;
};

type ShiftRecord = {
  _id?: string;
  volunteerId?: string;
  volunteerEmail?: string;
  volunteerName?: string;
};

type VolunteerProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  isAdult?: boolean;
};

type ExportVolunteer = {
  name: string;
  adults: string;
  kids: string;
};

const MISSING_EVENT_LABEL = "Event not recorded";

function formatDate(value?: string) {
  if (!value) return "Date unavailable";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function getEventLabel(donation: DonationRecord) {
  return donation.eventName?.trim() || MISSING_EVENT_LABEL;
}

function getEventFilterValue(donation: DonationRecord) {
  const eventId = donation.eventId?.trim();

  if (eventId) return eventId;

  return `name:${getEventLabel(donation)}`;
}

function getTimestamp(value?: string) {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatCsvCell(value: string | number) {
  const text = String(value ?? "");

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows.map((row) => row.map(formatCsvCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getSafeFilename(value: string) {
  const filename = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return filename || "event";
}

function getVolunteerDisplayName(shift: ShiftRecord, profile?: VolunteerProfile) {
  const profileName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "";

  return shift.volunteerName?.trim() || profileName || shift.volunteerEmail?.trim() || shift.volunteerId?.trim() || "";
}

function buildExportVolunteerRows(shifts: ShiftRecord[], profiles: VolunteerProfile[]) {
  const profilesByEmail = new Map<string, VolunteerProfile>();
  const profilesById = new Map<string, VolunteerProfile>();
  const volunteers = new Map<string, ExportVolunteer>();

  profiles.forEach((profile) => {
    if (profile.email) {
      profilesByEmail.set(profile.email.toLowerCase(), profile);
    }

    profilesById.set(profile.id, profile);
  });

  shifts.forEach((shift) => {
    const emailKey = shift.volunteerEmail?.toLowerCase() ?? "";
    const idKey = shift.volunteerId ?? "";
    const profile = (emailKey && profilesByEmail.get(emailKey)) || (idKey && profilesById.get(idKey)) || undefined;
    const name = getVolunteerDisplayName(shift, profile);

    if (!name) return;

    const key = emailKey || idKey || name.toLowerCase();
    const isAdult = profile?.isAdult;

    if (!volunteers.has(key)) {
      volunteers.set(key, {
        name,
        adults: isAdult === false ? "" : "1",
        kids: isAdult === false ? "1" : "",
      });
    }
  });

  return Array.from(volunteers.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("event");
  const [eventFilter, setEventFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    async function loadDonations() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/donations", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load donations.");
        }

        setDonations(data.donations ?? []);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Failed to load donations.");
      } finally {
        setLoading(false);
      }
    }

    loadDonations();
  }, []);

  const totalQuantity = useMemo(() => donations.reduce((sum, donation) => sum + donation.quantity, 0), [donations]);
  const eventOptions = useMemo(() => {
    const options = new Map<string, EventFilterOption>();

    donations.forEach((donation) => {
      const value = getEventFilterValue(donation);
      const eventName = getEventLabel(donation);
      const eventDate = donation.eventDate ?? "";
      const dateLabel = eventDate ? ` - ${formatDate(eventDate)}` : "";

      options.set(value, {
        value,
        eventId: donation.eventId ?? "",
        eventName,
        eventDate,
        label: `${eventName}${dateLabel}`,
      });
    });

    return Array.from(options.values()).sort(
      (a, b) => a.eventName.localeCompare(b.eventName) || getTimestamp(a.eventDate) - getTimestamp(b.eventDate),
    );
  }, [donations]);
  const selectedEventOption = eventOptions.find((event) => event.value === eventFilter);
  const visibleDonations = useMemo(() => {
    const filtered =
      eventFilter === "all" ? donations : donations.filter((donation) => getEventFilterValue(donation) === eventFilter);

    return [...filtered].sort((a, b) => {
      if (sortMode === "event") {
        const eventComparison = getEventLabel(a).localeCompare(getEventLabel(b));

        if (eventComparison !== 0) return eventComparison;
      }

      return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
    });
  }, [donations, eventFilter, sortMode]);

  async function handleExportCsv() {
    if (!selectedEventOption || visibleDonations.length === 0) return;

    try {
      setIsExporting(true);
      setExportError("");

      let shifts: ShiftRecord[] = [];
      let profiles: VolunteerProfile[] = [];

      if (selectedEventOption.eventId) {
        const [shiftsResponse, volunteersResponse] = await Promise.all([
          fetch(`/api/shifts?eventId=${encodeURIComponent(selectedEventOption.eventId)}`, { cache: "no-store" }),
          fetch("/api/volunteers", { cache: "no-store" }),
        ]);

        const shiftsData = await shiftsResponse.json();
        const volunteersData = await volunteersResponse.json();

        if (!shiftsResponse.ok) {
          throw new Error(shiftsData.message || "Failed to load event volunteers.");
        }

        shifts = Array.isArray(shiftsData) ? shiftsData : [];
        profiles = Array.isArray(volunteersData.volunteers) ? volunteersData.volunteers : [];
      }

      const volunteerRows = buildExportVolunteerRows(shifts, profiles);
      const eventTitle = selectedEventOption.eventDate
        ? `${selectedEventOption.eventName} (${formatDate(selectedEventOption.eventDate)})`
        : selectedEventOption.eventName;
      const csvRows: Array<Array<string | number>> = [
        [`MUCH Hope - ${eventTitle}`],
        ["Note: Your expenses for this outreach are tax deductible."],
        ["Please provide a copy or picture of receipts to our Treasurer Yuki Ichiriu (yuki@much-hope.org)."],
        [],
        ["Provisions", "Quantity Needed", "Provided by"],
        ...visibleDonations.map((donation) => [
          donation.provisions,
          donation.quantity,
          `${donation.firstName} ${donation.lastName}`.trim(),
        ]),
        [],
        [`Volunteers for ${eventTitle}`],
        ["Name", "Adults", "Kids below 12 yrs"],
        ...(volunteerRows.length > 0
          ? volunteerRows.map((volunteer) => [volunteer.name, volunteer.adults, volunteer.kids])
          : [["No volunteers found", "", ""]]),
      ];

      downloadCsv(`much-hope-${getSafeFilename(selectedEventOption.eventName)}.csv`, csvRows);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Unable to export this event.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <AuthLayout>
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.breadcrumb}>
            <Link href="/admin" className={styles.breadcrumbLink}>
              Admin
            </Link>
            <span className={styles.breadcrumbSeparator}>&gt;</span>
            <span className={styles.activeBreadcrumb}>Donations</span>
          </div>

          <header className={styles.pageHeader}>
            <div>
              <h1 className={styles.title}>Donations</h1>
              <p className={styles.subtitle}>View submitted provisions and donor contact information.</p>
            </div>
            <Link href="/Donate" className={styles.actionLink}>
              Make Donation
            </Link>
          </header>

          <section className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Submissions</span>
              <strong className={styles.summaryValue}>{donations.length}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Quantity</span>
              <strong className={styles.summaryValue}>{totalQuantity}</strong>
            </div>
          </section>

          <div className={styles.listHeader}>
            <div>
              <p className={styles.sectionLabel}>Donation Records</p>
              <p className={styles.listSubtext}>
                Showing {visibleDonations.length} of {donations.length}
              </p>
            </div>
            <div className={styles.recordControls}>
              <label className={styles.controlLabel}>
                <span>Sort</span>
                <select
                  value={sortMode}
                  onChange={(e) => {
                    setSortMode(e.target.value as SortMode);
                    setExportError("");
                  }}
                  className={styles.controlSelect}
                >
                  <option value="event">Event</option>
                  <option value="newest">Newest</option>
                </select>
              </label>
              <label className={styles.controlLabel}>
                <span>Event</span>
                <select
                  value={eventFilter}
                  onChange={(e) => {
                    setEventFilter(e.target.value);
                    setExportError("");
                  }}
                  className={styles.controlSelect}
                  disabled={eventOptions.length === 0}
                >
                  <option value="all">All Events</option>
                  {eventOptions.map((eventOption) => (
                    <option key={eventOption.value} value={eventOption.value}>
                      {eventOption.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className={styles.exportButton}
                onClick={handleExportCsv}
                disabled={!selectedEventOption || visibleDonations.length === 0 || isExporting}
              >
                {isExporting ? "Exporting..." : "Export CSV"}
              </button>
              <span className={styles.countBadge}>{visibleDonations.length}</span>
            </div>
          </div>
          {exportError && <p className={styles.exportError}>{exportError}</p>}

          <section className={styles.list}>
            {loading ? (
              <div className={styles.emptyState}>Loading donations...</div>
            ) : errorMessage ? (
              <div className={styles.errorState}>{errorMessage}</div>
            ) : donations.length === 0 ? (
              <div className={styles.emptyState}>No donations have been submitted yet.</div>
            ) : visibleDonations.length === 0 ? (
              <div className={styles.emptyState}>No donations match this event.</div>
            ) : (
              visibleDonations.map((donation) => (
                <article key={donation.id} className={styles.card}>
                  <div className={styles.cardMain}>
                    <div className={styles.avatar}>{getInitials(donation.firstName, donation.lastName)}</div>
                    <div className={styles.donorBlock}>
                      <h2 className={styles.donorName}>
                        {donation.firstName} {donation.lastName}
                      </h2>
                      <p className={styles.contactLine}>{donation.email}</p>
                      <p className={styles.contactLine}>{donation.phoneNumber || "No phone number"}</p>
                    </div>
                  </div>

                  <div className={styles.detailsBlock}>
                    <div>
                      <span className={styles.cardLabel}>Event</span>
                      <p className={styles.eventText}>{donation.eventName}</p>
                      {donation.eventDate && <p className={styles.eventDate}>{formatDate(donation.eventDate)}</p>}
                    </div>
                    <div>
                      <span className={styles.cardLabel}>Provisions</span>
                      <p className={styles.provisionsText}>{donation.provisions}</p>
                    </div>
                    {donation.photoDataUrl && (
                      <div>
                        <span className={styles.cardLabel}>Photo</span>
                        <a href={donation.photoDataUrl} target="_blank" rel="noreferrer" className={styles.photoLink}>
                          <img
                            src={donation.photoDataUrl}
                            alt={donation.photoName || "Donation"}
                            className={styles.photoThumb}
                          />
                          <span>{donation.photoName || "View photo"}</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <div className={styles.metaBlock}>
                    <div>
                      <span className={styles.cardLabel}>Quantity</span>
                      <strong className={styles.quantity}>{donation.quantity}</strong>
                    </div>
                    <div>
                      <span className={styles.cardLabel}>Submitted</span>
                      <span className={styles.dateText}>{formatDate(donation.createdAt)}</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </main>
    </AuthLayout>
  );
}
