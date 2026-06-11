// frontend/src/components/Donation.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import AuthLayout from "@/app/AuthLayout";
import styles from "@/styles/donation.module.css";

type GuestForm = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

type DonationForm = {
  eventId: string;
  provisions: string;
  quantity: string;
};

type SubmitStatus = {
  type: "success" | "error" | null;
  message: string;
};

type EventOption = {
  id: string;
  title: string;
  date: string;
  time?: string;
};

type DonationPhoto = {
  name: string;
  type: string;
  dataUrl: string;
};

const MAX_PHOTO_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_PHOTO_DIMENSION = 1200;
const PHOTO_QUALITY = 0.82;

const emptyGuestForm: GuestForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
};

const initialDonationForm: DonationForm = {
  eventId: "",
  provisions: "",
  quantity: "1",
};

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function getPhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function Donation() {
  const { user, isLoaded, isSignedIn } = useUser();
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [guestForm, setGuestForm] = useState<GuestForm>(emptyGuestForm);
  const [donationForm, setDonationForm] = useState<DonationForm>(initialDonationForm);
  const [donationPhoto, setDonationPhoto] = useState<DonationPhoto | null>(null);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ type: null, message: "" });

  const profile = useMemo(
    () => ({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.primaryEmailAddress?.emailAddress ?? "",
      phoneNumber: (user?.publicMetadata?.phoneNumber as string | undefined) ?? "",
    }),
    [user],
  );

  const profileName = `${profile.firstName} ${profile.lastName}`.trim();
  const selectedEvent = events.find((event) => event.id === donationForm.eventId);

  useEffect(() => {
    async function loadUpcomingEvents() {
      try {
        setEventsLoading(true);
        setEventsError("");

        const response = await fetch("/api/events?timeframe=upcoming", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load upcoming events.");
        }

        const nextEvents = Array.isArray(data)
          ? data
              .map((event) => ({
                id: String(event.id ?? ""),
                title: String(event.title ?? event.name ?? ""),
                date: String(event.date ?? ""),
                time: event.time ? String(event.time) : "",
              }))
              .filter((event) => event.id && event.title)
          : [];

        setEvents(nextEvents);
      } catch (err) {
        setEventsError(err instanceof Error ? err.message : "Failed to load upcoming events.");
      } finally {
        setEventsLoading(false);
      }
    }

    loadUpcomingEvents();
  }, []);

  function clearStatus() {
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: "" });
    }
  }

  function handleGuestChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const nextValue = name === "phoneNumber" ? formatPhoneNumber(value) : value;
    setGuestForm((current) => ({ ...current, [name]: nextValue }));
    clearStatus();
  }

  function handleDonationChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setDonationForm((current) => ({ ...current, [name]: value }));
    clearStatus();
  }

  function resizePhoto(file: File) {
    return new Promise<string>((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        const scale = Math.min(1, MAX_PHOTO_DIMENSION / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Unable to process this image."));
          return;
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL("image/jpeg", PHOTO_QUALITY));
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Please upload a valid image file."));
      };

      image.src = objectUrl;
    });
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    clearStatus();

    if (!file) {
      setDonationPhoto(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setDonationPhoto(null);
      setSubmitStatus({ type: "error", message: "Please upload an image file." });
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setDonationPhoto(null);
      setSubmitStatus({ type: "error", message: "Please upload a photo smaller than 8 MB." });
      return;
    }

    try {
      const dataUrl = await resizePhoto(file);
      setDonationPhoto({
        name: file.name,
        type: "image/jpeg",
        dataUrl,
      });
    } catch (err) {
      setDonationPhoto(null);
      setSubmitStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Unable to process this image.",
      });
    }
  }

  function removePhoto() {
    setDonationPhoto(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
    clearStatus();
  }

  function validateForm() {
    const provisions = donationForm.provisions.trim();
    const quantity = Number(donationForm.quantity);

    if (eventsLoading) {
      return "Upcoming events are still loading. Please try again in a moment.";
    }

    if (eventsError) {
      return "Upcoming events could not be loaded. Please refresh and try again.";
    }

    if (!selectedEvent) {
      return "Please select the upcoming event this donation is for.";
    }

    if (!provisions) {
      return "Please enter what provisions are being donated.";
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return "Please enter a quantity of at least 1.";
    }

    if (isSignedIn) {
      if (!profile.firstName || !profile.lastName || !profile.email) {
        return "Your profile is missing a name or email. Please update your profile before submitting a donation.";
      }
      return "";
    }

    const firstName = guestForm.firstName.trim();
    const lastName = guestForm.lastName.trim();
    const email = guestForm.email.trim();
    const phoneNumber = guestForm.phoneNumber.trim();

    if (!firstName || !lastName || !email || !phoneNumber) {
      return "Please fill in your contact information.";
    }

    if (!isValidEmail(email)) {
      return "Please enter a valid email address.";
    }

    if (getPhoneDigits(phoneNumber).length !== 10) {
      return "Please enter a valid 10-digit phone number.";
    }

    return "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isLoaded) {
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setSubmitStatus({ type: "error", message: validationError });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    const payload = {
      ...(isSignedIn
        ? {}
        : {
            firstName: guestForm.firstName.trim(),
            lastName: guestForm.lastName.trim(),
            email: guestForm.email.trim(),
            phoneNumber: guestForm.phoneNumber.trim(),
          }),
      provisions: donationForm.provisions.trim(),
      quantity: Number(donationForm.quantity),
      eventId: selectedEvent?.id ?? "",
      eventName: selectedEvent?.title ?? "",
      eventDate: selectedEvent?.date ?? "",
      photoName: donationPhoto?.name ?? "",
      photoType: donationPhoto?.type ?? "",
      photoDataUrl: donationPhoto?.dataUrl ?? "",
    };

    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit donation.");
      }

      setDonationForm(initialDonationForm);
      setDonationPhoto(null);
      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
      if (!isSignedIn) {
        setGuestForm(emptyGuestForm);
      }
      setSubmitStatus({ type: "success", message: "Donation recorded. Thank you for supporting Much Hope." });
    } catch (err) {
      setSubmitStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Unable to submit donation.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroText}>
              <p className={styles.sectionLabel}>Donations</p>
              <h1 className={styles.heroTitle}>
                Donate Items.
                <br />
                <em>Give Hope.</em>
              </h1>
              <p className={styles.heroSubtitle}>
                Share what you are bringing and the Much Hope team will have a record of your donation.
              </p>
            </div>
            <div className={styles.heroImage}>
              <img src="/event-photos/landing-page-image.jpg" alt="" />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.receiptBanner}>
            <strong>Note:</strong> Your expenses for this outreach are tax deductible. Please provide a copy or picture
            of receipts to our Treasurer Yuki Ichiriu (<a href="mailto:yuki@much-hope.org">yuki@much-hope.org</a>).
          </div>

          <div className={styles.formShell}>
            <div className={styles.formIntro}>
              <p className={styles.sectionLabel}>Donation Form</p>
            </div>

            {!isLoaded ? (
              <div className={styles.loadingState}>Loading donation form...</div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                {isSignedIn ? (
                  <div className={styles.profilePanel}>
                    <div>
                      <span className={styles.detailLabel}>Donor Name</span>
                      <strong className={styles.detailValue}>{profileName || "Name missing"}</strong>
                    </div>
                    <div>
                      <span className={styles.detailLabel}>Email</span>
                      <strong className={styles.detailValue}>{profile.email || "Email missing"}</strong>
                    </div>
                    <div>
                      <span className={styles.detailLabel}>Phone Number</span>
                      <strong className={styles.detailValue}>{profile.phoneNumber || "Not provided"}</strong>
                    </div>
                  </div>
                ) : (
                  <div className={styles.guestGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="firstName" className={styles.label}>
                        First Name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={guestForm.firstName}
                        onChange={handleGuestChange}
                        className={styles.input}
                        autoComplete="given-name"
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="lastName" className={styles.label}>
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={guestForm.lastName}
                        onChange={handleGuestChange}
                        className={styles.input}
                        autoComplete="family-name"
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="email" className={styles.label}>
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={guestForm.email}
                        onChange={handleGuestChange}
                        className={styles.input}
                        autoComplete="email"
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="phoneNumber" className={styles.label}>
                        Phone Number
                      </label>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={guestForm.phoneNumber}
                        onChange={handleGuestChange}
                        className={styles.input}
                        autoComplete="tel"
                        maxLength={14}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className={styles.donationGrid}>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label htmlFor="eventId" className={styles.label}>
                      Upcoming Event
                    </label>
                    <select
                      id="eventId"
                      name="eventId"
                      value={donationForm.eventId}
                      onChange={handleDonationChange}
                      className={styles.select}
                      disabled={eventsLoading || events.length === 0}
                      required
                    >
                      <option value="">
                        {eventsLoading
                          ? "Loading upcoming events..."
                          : events.length === 0
                            ? "No upcoming events available"
                            : "Select an event"}
                      </option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {[event.title, event.date, event.time].filter(Boolean).join(" - ")}
                        </option>
                      ))}
                    </select>
                    {eventsError && <p className={styles.fieldHelp}>{eventsError}</p>}
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label htmlFor="provisions" className={styles.label}>
                      Provisions
                    </label>
                    <textarea
                      id="provisions"
                      name="provisions"
                      value={donationForm.provisions}
                      onChange={handleDonationChange}
                      className={styles.textarea}
                      rows={5}
                      required
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label htmlFor="donationPhoto" className={styles.label}>
                      Donation Photo
                    </label>
                    <input
                      ref={photoInputRef}
                      id="donationPhoto"
                      name="donationPhoto"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className={styles.fileInput}
                    />
                    <div className={styles.uploadBox}>
                      <label htmlFor="donationPhoto" className={styles.uploadButton}>
                        Choose Photo
                      </label>
                      <div className={styles.uploadText}>
                        <span>{donationPhoto ? "Photo selected" : "No photo selected"}</span>
                        <small>JPG, PNG, WebP, or GIF up to 8 MB</small>
                      </div>
                    </div>
                    {donationPhoto && (
                      <div className={styles.photoPreview}>
                        <img src={donationPhoto.dataUrl} alt="Donation preview" />
                        <div className={styles.photoMeta}>
                          <span>{donationPhoto.name}</span>
                          <button type="button" onClick={removePhoto} className={styles.removePhotoButton}>
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="quantity" className={styles.label}>
                      Quantity
                    </label>
                    <input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      step="1"
                      value={donationForm.quantity}
                      onChange={handleDonationChange}
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                {submitStatus.type && (
                  <div
                    className={`${styles.statusMessage} ${
                      submitStatus.type === "success" ? styles.success : styles.error
                    }`}
                  >
                    {submitStatus.message}
                  </div>
                )}

                <div className={styles.buttonRow}>
                  <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Donation"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </AuthLayout>
  );
}
