"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/AppNavbar";
import MemberCard from "../../components/MemberCard";
import ViewProfilePopUp from "../../components/ViewProfilePopUp";
import styles from "../../styles/members.module.css";

interface Volunteer {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isAdult: boolean;
  userType: string;
}

type ModalState = "none" | "viewProfile" | "manage";

export default function MembersPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>("none");
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

  useEffect(() => {
    async function fetchVolunteers() {
      try {
        const res = await fetch("/api/volunteers");
        if (!res.ok) throw new Error("Failed to fetch volunteers");
        const data = await res.json();
        setVolunteers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchVolunteers();
  }, []);

  const admins = volunteers.filter((v) => v.userType === "main admin" || v.userType === "event admin");
  const regularVolunteers = volunteers.filter((v) => v.userType === "volunteer");

  const openViewProfile = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setModalState("viewProfile");
  };

  const openManage = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setModalState("manage");
  };

  const closeModal = () => {
    setModalState("none");
    setSelectedVolunteer(null);
  };

  const handleDelete = async (volunteerId: string) => {
    if (!confirm("Are you sure you want to delete this volunteer?")) return;
    try {
      const res = await fetch(`/api/volunteers/${volunteerId}/delete`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete volunteer");
      setVolunteers((prev) => prev.filter((v) => v.id !== volunteerId));
      closeModal();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMakeEventAdmin = async (volunteerId: string, eventId: string) => {
    try {
      const res = await fetch(`/api/volunteers/${volunteerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      const data = await res.json();
      setVolunteers((prev) => prev.map((v) => (v.id === volunteerId ? { ...v, ...data.volunteer } : v)));
      closeModal();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className={styles.pageLayout}>
      <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`${styles.mainContent} ${collapsed ? styles.mainContentCollapsed : styles.mainContentExpanded}`}>
        {loading ? (
          <p className={styles.statusText}>Loading members...</p>
        ) : error ? (
          <p className={styles.errorText}>{error}</p>
        ) : (
          <>
            <h1 className={styles.sectionTitle}>Admins</h1>
            <div className={styles.list}>
              {admins.length > 0 ? (
                admins.map((v) => (
                  <MemberCard
                    key={v.id}
                    name={`${v.firstName} ${v.lastName}`}
                    role={v.userType === "main admin" ? "Main Admin" : "Admin"}
                    onViewProfile={() => openViewProfile(v)}
                    onManage={() => openManage(v)}
                  />
                ))
              ) : (
                <p className={styles.emptyText}>No admins found.</p>
              )}
            </div>

            <h1 className={styles.sectionTitle}>Volunteers</h1>
            <div className={styles.list}>
              {regularVolunteers.length > 0 ? (
                regularVolunteers.map((v) => (
                  <MemberCard
                    key={v.id}
                    name={`${v.firstName} ${v.lastName}`}
                    role="Volunteer"
                    onViewProfile={() => openViewProfile(v)}
                    onManage={() => openManage(v)}
                  />
                ))
              ) : (
                <p className={styles.emptyText}>No volunteers found.</p>
              )}
            </div>
          </>
        )}
      </main>

      {modalState === "viewProfile" && selectedVolunteer && (
        <ViewProfilePopUp volunteer={selectedVolunteer} onClose={closeModal} />
      )}

      {modalState === "manage" && selectedVolunteer && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.manageModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>
              &times;
            </button>
            <h2 className={styles.manageTitle}>
              Manage {selectedVolunteer.firstName} {selectedVolunteer.lastName}
            </h2>
            <div className={styles.manageActions}>
              <button className={styles.deleteButton} onClick={() => handleDelete(selectedVolunteer.id)}>
                Delete Volunteer
              </button>
              <button
                className={styles.adminButton}
                onClick={() => {
                  const eventId = prompt("Enter the Event ID to assign as admin:");
                  if (eventId) {
                    handleMakeEventAdmin(selectedVolunteer.id, eventId);
                  }
                }}
              >
                Make Event Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
