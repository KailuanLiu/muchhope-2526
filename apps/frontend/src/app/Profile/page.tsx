"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import AuthLayout from "../AuthLayout";
import ProfileForm from "../../components/ProfileForm";
import UpcomingShifts from "../../components/UpcomingShifts";
import styles from "../../styles/adminprofile.module.css";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  // isAdult can live in Clerk metadata (after a profile save) or only in the
  // MongoDB volunteer record (set at signup). Fall back to the DB record.
  const [dbIsAdult, setDbIsAdult] = useState<boolean | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    const email = user.primaryEmailAddress?.emailAddress ?? "";
    const clerkId = user.id;

    const fetchVolunteer = async () => {
      try {
        const res = await fetch("/api/volunteers");
        const data = await res.json();
        const volunteers: any[] = Array.isArray(data?.volunteers) ? data.volunteers : [];
        const match = volunteers.find(
          (v) => v.id === clerkId || (email && v.email && v.email.toLowerCase() === email.toLowerCase()),
        );
        if (match && typeof match.isAdult === "boolean") {
          setDbIsAdult(match.isAdult);
        }
      } catch {
        // Silently ignore; the badge just won't show if we can't resolve age.
      }
    };

    fetchVolunteer();
  }, [user]);

  const handleEditPhoto = () => {
    fileInput.current?.click();
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file.");
      return;
    }

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setUploadError("Failed to upload photo.");
        return;
      }
      await user?.reload();
    } catch {
      setUploadError("Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  if (!isLoaded) {
    return (
      <AuthLayout hideFooter>
        <div className={styles.pageContainer}>
          <p>Loading...</p>
        </div>
      </AuthLayout>
    );
  }

  const firstName = user?.firstName ?? "";
  const lastName = user?.lastName ?? "";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const photoUrl = user?.imageUrl ?? "";
  const metaIsAdult = user?.publicMetadata?.isAdult as boolean | undefined;
  // Prefer Clerk metadata, fall back to the DB record.
  const resolvedIsAdult = metaIsAdult ?? dbIsAdult ?? undefined;
  const isMinor = resolvedIsAdult === false;

  return (
    <AuthLayout hideFooter>
      <div className={styles.pageContainer}>
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <span className={styles.activeBreadcrumb}>My Profile</span>
        </div>

        <h1 className={styles.pageTitle}>My Profile</h1>

        <div className={styles.twoCol}>
          {/* ── Left: Sidebar (connected) ── */}
          <aside className={styles.sidebarCard}>
            <div className={styles.sidebarTop}>
              <div className={`${styles.avatarWrap} ${uploading ? styles.uploading : ""}`}>
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatarFallback}>
                    <span className={styles.avatarInitials}>
                      {firstName.charAt(0)}
                      {lastName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <button type="button" className={styles.editPhotoButton} onClick={handleEditPhoto} disabled={uploading}>
                {uploading ? "Uploading..." : "Edit Photo"}
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
              {uploadError && <p className={styles.uploadError}>{uploadError}</p>}

              <h2 className={styles.sidebarName}>
                {firstName} {lastName}
              </h2>
              <p className={styles.sidebarRole}>
                Volunteer
                {isMinor && <span className={styles.minorTag}>Minor</span>}
              </p>
            </div>

            <div className={styles.sidebarBody}>
              <span className={styles.verifiedBadge}>Volunteer</span>
            </div>
          </aside>

          {/* ── Right: Form sections ── */}
          <div className={styles.mainPanel}>
            <ProfileForm
              showAgeStatus
              initialData={{
                firstName,
                lastName,
                email,
                phoneNumber: (user?.publicMetadata?.phoneNumber as string) ?? "",
                aboutMe: (user?.publicMetadata?.aboutMe as string) ?? "",
                isAdult: resolvedIsAdult ?? false,
              }}
              onSave={() => user!.reload()}
            />
          </div>
        </div>

        <div className={styles.shiftsSection}>
          <UpcomingShifts volunteerEmail={email} />
        </div>
      </div>
    </AuthLayout>
  );
}
