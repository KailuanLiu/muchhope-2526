"use client";

import { useState } from "react";
import ProfileForm from "../../components/ProfileForm";
import UpcomingShifts from "../../components/UpcomingShifts";
import Navbar from "../../components/AppNavbar";
import styles from "../../styles/profile.module.css";

export default function ProfilePage() {
  const [collapsed, setCollapsed] = useState(false);
  // TODO: Replace with actual user data from authentication/database
  // Once team decides on architecture (Option A or B), wire up real data
  const mockVolunteerData = {
    firstName: "Jane",
    lastName: "Doe",
    phoneNumber: "(555) 123-4567",
    email: "jane.doe@example.com",
    isAdult: true,
    photoUrl: "",
  };

  const handleEditPhoto = () => {
    // TODO: Handle photo upload
  };

  return (
    <div className={styles.pageLayout}>
      <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`${styles.mainContent} ${collapsed ? styles.mainContentCollapsed : styles.mainContentExpanded}`}>
        <h1 className={styles.pageTitle}>Volunteer Dashboard</h1>

        <div className={styles.profileHeader}>
          <div className={styles.photoContainer}>
            {mockVolunteerData.photoUrl ? (
              <img src={mockVolunteerData.photoUrl} alt="Profile" className={styles.profilePhoto} />
            ) : (
              <div className={styles.photoPlaceholder}>
                <span className={styles.photoInitials}>
                  {mockVolunteerData.firstName.charAt(0)}
                  {mockVolunteerData.lastName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className={styles.headerInfo}>
            <h2 className={styles.userName}>
              {mockVolunteerData.firstName} {mockVolunteerData.lastName}
            </h2>
            <p className={styles.userEmail}>{mockVolunteerData.email}</p>
          </div>
          <button className={styles.editPhotoButton} onClick={handleEditPhoto}>
            Edit Photo
          </button>
        </div>

        <div className={styles.columnsWrapper}>
          <div className={styles.leftColumn}>
            <ProfileForm
              initialData={{
                firstName: mockVolunteerData.firstName,
                lastName: mockVolunteerData.lastName,
                phoneNumber: mockVolunteerData.phoneNumber,
                isAdult: mockVolunteerData.isAdult,
              }}
            />
          </div>
          <div className={styles.rightColumn}>
            <UpcomingShifts volunteerEmail={mockVolunteerData.email} />
          </div>
        </div>
      </main>
    </div>
  );
}
