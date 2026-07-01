"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthLayout from "@/app/AuthLayout";
import styles from "@/styles/volunteers.module.css";
import type { Volunteer } from "@/types/volunteer";
import VolunteerProfilePopUp from "@/components/VolunteerProfilePopUp";

type RoleFilter = "All" | "Main Admin" | "Admin" | "Volunteer";
type AgeFilter = "All" | "Adult" | "Minor";

const ROLE_FILTERS: RoleFilter[] = ["All", "Main Admin", "Admin", "Volunteer"];
const AGE_FILTERS: AgeFilter[] = ["All", "Adult", "Minor"];

function normalizeRole(role?: string, userType?: string): Exclude<RoleFilter, "All"> {
  const rawRole = (role || userType || "Volunteer").trim().toLowerCase();

  if (rawRole.includes("main") && rawRole.includes("admin")) return "Main Admin";
  if (rawRole.includes("admin")) return "Admin";

  return "Volunteer";
}

function getIsAdult(volunteer: Volunteer) {
  if (typeof volunteer.isAdult === "boolean") return volunteer.isAdult;
  if (typeof volunteer.age === "number") return volunteer.age >= 18;

  return true;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function roleBadgeClass(role: Exclude<RoleFilter, "All">) {
  if (role === "Main Admin") return styles.roleBadgeMain;
  if (role === "Admin") return styles.roleBadgeAdmin;
  return styles.roleBadgeVolunteer;
}

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [roleActionId, setRoleActionId] = useState<string | null>(null);
  const [roleActionError, setRoleActionError] = useState("");

  // filtering
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [ageFilter, setAgeFilter] = useState<AgeFilter>("All");

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

  async function handleAddVolunteer(data: Volunteer) {
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
          email: data.email?.trim() ?? "",
          phoneNumber: data.phoneNumber?.trim() ?? "",
          role: data.role.trim() || "Volunteer",
          isAdult: data.isAdult,
          notes: data.notes?.trim() ?? "",
          shiftDetails: {
            eventName: data.shiftDetails?.eventName?.trim() ?? "",
            shiftType: data.shiftDetails?.shiftType?.trim() ?? "",
            shiftTime: data.shiftDetails?.shiftTime?.trim() ?? "",
          },
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

  async function handleRoleChange(volunteer: Volunteer, action: "promote" | "demote") {
    if (!volunteer.clerkId) {
      setRoleActionError("This user has not signed in yet, so their role cannot be changed.");
      return;
    }

    setRoleActionError("");
    setRoleActionId(volunteer.id);

    try {
      const endpoint = action === "promote" ? "/api/admin/promote" : "/api/admin/demote";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: volunteer.clerkId }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Failed to ${action} user`);
      }

      const nextRole = action === "promote" ? "Admin" : "Volunteer";
      setVolunteers((prev) =>
        prev.map((v) => (v.id === volunteer.id ? { ...v, role: nextRole, userType: nextRole } : v)),
      );
    } catch (error) {
      console.error(`${action} volunteer error:`, error);
      setRoleActionError(error instanceof Error ? error.message : `Failed to ${action} user`);
    } finally {
      setRoleActionId(null);
    }
  }

  const filteredVolunteers = useMemo(() => {
    return volunteers
      .map((volunteer) => ({
        ...volunteer,
        role: normalizeRole(volunteer.role, volunteer.userType),
        isAdult: getIsAdult(volunteer),
      }))
      .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
      .filter((v) => roleFilter === "All" || v.role === roleFilter)
      .filter((v) => {
        if (ageFilter === "All") return true;
        if (ageFilter === "Adult") return v.isAdult;
        if (ageFilter === "Minor") return !v.isAdult;
        return true;
      });
  }, [volunteers, roleFilter, ageFilter]);

  return (
    <AuthLayout>
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.breadcrumb}>
            <Link href="/admin" className={styles.breadcrumbLink}>
              Admin
            </Link>
            <span className={styles.breadcrumbSeparator}>&gt;</span>
            <span className={styles.activeBreadcrumb}>Manage Users</span>
          </div>

          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.title}>Manage Users</h1>
              <p className={styles.subtitle}>Manage members, roles, and contact information.</p>
            </div>

            <button
              type="button"
              disabled={submitting}
              className={styles.addButton}
              onClick={() => setIsAddPopupOpen(true)}
            >
              {submitting ? "Adding..." : "+ Add Member"}
            </button>
          </div>

          <div className={styles.filterBar}>
            <div className={styles.filterGroup}>
              {ROLE_FILTERS.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`${styles.filterPill} ${roleFilter === role ? styles.filterPillActive : ""}`}
                  onClick={() => setRoleFilter(role)}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className={styles.filterGroup}>
              {AGE_FILTERS.map((age) => (
                <button
                  key={age}
                  type="button"
                  className={`${styles.filterPill} ${ageFilter === age ? styles.filterPillActive : ""}`}
                  onClick={() => setAgeFilter(age)}
                >
                  {age}
                </button>
              ))}
            </div>

            <span className={styles.resultCount}>
              {filteredVolunteers.length} member{filteredVolunteers.length === 1 ? "" : "s"}
            </span>
          </div>

          {roleActionError && <p className={styles.errorText}>{roleActionError}</p>}

          <div className={styles.list}>
            {loading ? (
              <div className={styles.emptyState}>Loading volunteers...</div>
            ) : volunteers.length === 0 ? (
              <div className={styles.emptyState}>No volunteers yet.</div>
            ) : filteredVolunteers.length === 0 ? (
              <div className={styles.emptyState}>No members match these filters.</div>
            ) : (
              filteredVolunteers.map((volunteer) => (
                <article key={volunteer.id} className={styles.card}>
                  <div className={styles.cardLeft}>
                    <div className={styles.avatar}>{getInitials(volunteer.firstName, volunteer.lastName)}</div>

                    <div className={styles.cardContent}>
                      <h2 className={styles.name}>
                        {volunteer.firstName} {volunteer.lastName}
                      </h2>
                      <span className={`${styles.roleBadge} ${roleBadgeClass(volunteer.role)}`}>{volunteer.role}</span>
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button type="button" className={styles.viewButton} onClick={() => setSelectedVolunteer(volunteer)}>
                      View Info
                    </button>

                    {volunteer.role === "Admin" && (
                      <button
                        type="button"
                        onClick={() => handleRoleChange(volunteer, "demote")}
                        disabled={roleActionId === volunteer.id}
                        className={styles.viewButton}
                      >
                        {roleActionId === volunteer.id ? "Demoting..." : "Demote"}
                      </button>
                    )}

                    {volunteer.role === "Volunteer" && (
                      <button
                        type="button"
                        onClick={() => handleRoleChange(volunteer, "promote")}
                        disabled={roleActionId === volunteer.id}
                        className={styles.viewButton}
                      >
                        {roleActionId === volunteer.id ? "Promoting..." : "Promote"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteVolunteer(volunteer.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
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
            onSave={handleAddVolunteer}
            onDelete={() => {}}
          />
        )}
      </main>
    </AuthLayout>
  );
}
