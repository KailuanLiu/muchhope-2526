"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthLayout from "../../AuthLayout";
import styles from "@/styles/volunteers.module.css";
import type { Volunteer } from "@/types/volunteer";
import VolunteerProfilePopUp from "@/components/VolunteerProfilePopUp";

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);

  async function loadVolunteers() {
    try {
      setLoading(true);
      const res = await fetch("/api/volunteers", { cache: "no-store" });

      if (!res.ok) throw new Error("Failed to load volunteers");

      const data = await res.json();
      setVolunteers(data.volunteers ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVolunteers();
  }, []);

  async function handleAddVolunteer(data: { firstName: string; lastName: string; role: string }) {
    if (!data.firstName.trim() || !data.lastName.trim()) return;

    try {
      setSubmitting(true);

      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          role: data.role.trim() || "Volunteer",
        }),
      });

      const text = await res.text();
      const responseData = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(responseData?.error || responseData?.message || "Failed to add volunteer");
      }

      const newVolunteer: Volunteer = responseData?.volunteer ?? responseData;

      setVolunteers((prev) => [...prev, newVolunteer]);
      setIsAddPopupOpen(false);
    } catch (error) {
      console.error("Add volunteer error:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteVolunteer(id: string) {
    try {
      const res = await fetch(`/api/volunteers?id=${id}`, {
        method: "DELETE",
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Failed to delete volunteer");
      }

      setVolunteers((prev) => prev.filter((v) => v.id !== id));
      setSelectedVolunteer(null);
    } catch (error) {
      console.error("Delete volunteer error:", error);
    }
  }

  async function handleSaveVolunteer(updatedVolunteer: Volunteer) {
    try {
      console.log("Saving volunteer with id:", updatedVolunteer.id);
      console.log("Payload:", updatedVolunteer);

      if (!updatedVolunteer.id?.trim()) {
        throw new Error("Missing volunteer id in edit save");
      }

      const res = await fetch(`/api/volunteers?id=${updatedVolunteer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedVolunteer),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        console.error("Save volunteer failed:", {
          status: res.status,
          data,
        });

        throw new Error(data?.error || data?.message || "Failed to update volunteer");
      }

      const savedVolunteer: Volunteer = data?.volunteer;

      setVolunteers((prev) => prev.map((v) => (v.id === savedVolunteer.id ? savedVolunteer : v)));

      setSelectedVolunteer(savedVolunteer);
    } catch (error) {
      console.error("Failed to update volunteer:", error);
    }
  }

  function getInitials(firstName: string, lastName: string) {
    return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
  }

  const { admins, regularVolunteers } = useMemo(() => {
    const sorted = [...volunteers].sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    );

    return {
      admins: sorted.filter((volunteer) => volunteer.role === "Admin"),
      regularVolunteers: sorted.filter((volunteer) => volunteer.role !== "Admin"),
    };
  }, [volunteers]);

  return (
    <AuthLayout>
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.breadcrumb}>
            <Link href="/admin" className={styles.breadcrumbLink}>
              Admin
            </Link>
            <span className={styles.breadcrumbSeparator}>&gt;</span>
            <span className={styles.activeBreadcrumb}>Volunteers</span>
          </div>

          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.title}>Manage Users</h1>
              <p className={styles.subtitle}>Manage members profiles, roles, and contact information.</p>
            </div>
          </div>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.formTitle}>Add Volunteer</h2>
              <p className={styles.sectionDescription}>Create a new volunteer record for the dashboard.</p>
            </div>

            <div className={styles.form}>
              <button
                type="button"
                disabled={submitting}
                className={styles.addButton}
                onClick={() => setIsAddPopupOpen(true)}
              >
                {submitting ? "Adding..." : "Add Member"}
              </button>
            </div>
          </section>

          <div className={styles.listHeader}>
            <p className={styles.sectionLabel}>All Members</p>
            <span className={styles.countBadge}>{volunteers.length}</span>
          </div>

          <div className={styles.list}>
            {loading ? (
              <div className={styles.emptyState}>Loading volunteers...</div>
            ) : volunteers.length === 0 ? (
              <div className={styles.emptyState}>No volunteers yet.</div>
            ) : (
              <>
                {/* ADMINS */}
                {admins.length > 0 && (
                  <>
                    <div className={styles.listHeader}>
                      <p className={styles.sectionLabel}>Admins</p>
                      <span className={styles.countBadge}>{admins.length}</span>
                    </div>

                    {admins.map((volunteer) => (
                      <article key={volunteer.id} className={styles.card}>
                        <div className={styles.cardLeft}>
                          <div className={styles.avatar}>{getInitials(volunteer.firstName, volunteer.lastName)}</div>

                          <div className={styles.cardContent}>
                            <h2 className={styles.name}>
                              {volunteer.firstName} {volunteer.lastName}
                            </h2>
                            <p className={styles.roleText}>{volunteer.role}</p>
                          </div>
                        </div>

                        <div className={styles.actions}>
                          <button
                            type="button"
                            className={styles.viewButton}
                            onClick={() => setSelectedVolunteer(volunteer)}
                          >
                            View Info
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteVolunteer(volunteer.id)}
                            className={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </>
                )}

                {/* VOLUNTEERS */}
                {regularVolunteers.length > 0 && (
                  <>
                    <div className={styles.listHeader}>
                      <p className={styles.sectionLabel}>Volunteers</p>
                      <span className={styles.countBadge}>{regularVolunteers.length}</span>
                    </div>

                    {regularVolunteers.map((volunteer) => (
                      <article key={volunteer.id} className={styles.card}>
                        <div className={styles.cardLeft}>
                          <div className={styles.avatar}>{getInitials(volunteer.firstName, volunteer.lastName)}</div>

                          <div className={styles.cardContent}>
                            <h2 className={styles.name}>
                              {volunteer.firstName} {volunteer.lastName}
                            </h2>
                            <p className={styles.roleText}>{volunteer.role}</p>
                          </div>
                        </div>

                        <div className={styles.actions}>
                          <button
                            type="button"
                            className={styles.viewButton}
                            onClick={() => setSelectedVolunteer(volunteer)}
                          >
                            View Info
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteVolunteer(volunteer.id)}
                            className={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <VolunteerProfilePopUp
          key={selectedVolunteer?.id ?? "closed"}
          volunteer={selectedVolunteer}
          mode="edit"
          onClose={() => setSelectedVolunteer(null)}
          onSave={handleSaveVolunteer}
          onDelete={handleDeleteVolunteer}
        />

        {isAddPopupOpen && (
          <VolunteerProfilePopUp
            key="create-open"
            volunteer={null}
            mode="create"
            onClose={() => setIsAddPopupOpen(false)}
            onSave={(newVolunteer) =>
              handleAddVolunteer({
                firstName: newVolunteer.firstName,
                lastName: newVolunteer.lastName,
                role: newVolunteer.role || "Volunteer",
              })
            }
            onDelete={() => {}}
          />
        )}
      </main>
    </AuthLayout>
  );
}
