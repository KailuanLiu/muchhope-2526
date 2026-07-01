"use client";

import { useUser } from "@clerk/nextjs";
import React, { useRef, useState } from "react";
import Link from "next/link";
import AuthLayout from "../../AuthLayout";
import AdminProfile from "../../../components/admin/AdminProfile";
import styles from "../../../styles/adminprofile.module.css";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);

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

  return (
    <AuthLayout hideFooter>
      <div className={styles.pageContainer}>
        <div className={styles.breadcrumb}>
          <Link href="/admin" className={styles.breadcrumbLink}>
            Admin
          </Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <span className={styles.activeBreadcrumb}>My Profile</span>
        </div>

        <h1 className={styles.pageTitle}>My Profile</h1>

        <div className={styles.twoCol}>
          {/* ── Left: Sidebar card ── */}
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
              <p className={styles.sidebarRole}>Administrator</p>
            </div>

            <div className={styles.sidebarBody}>
              <span className={styles.verifiedBadge}>Main Admin</span>

              <div className={styles.sidebarStat}>
                <span className={styles.sidebarStatLabel}>Email</span>
                <span className={styles.sidebarStatValue}>{email}</span>
              </div>
              <div className={styles.sidebarStat}>
                <span className={styles.sidebarStatLabel}>Phone</span>
                <span className={styles.sidebarStatValue}>{(user?.publicMetadata?.phoneNumber as string) ?? "—"}</span>
              </div>
              <div className={styles.sidebarStat}>
                <span className={styles.sidebarStatLabel}>Role</span>
                <span className={styles.sidebarStatValue}>Admin</span>
              </div>
            </div>
          </aside>

          {/* ── Right: Form sections ── */}
          <div className={styles.mainPanel}>
            <AdminProfile
              initialData={{
                firstName,
                lastName,
                email,
                phoneNumber: (user?.publicMetadata?.phoneNumber as string) ?? "",
                aboutMe: (user?.publicMetadata?.aboutMe as string) ?? "",
              }}
              onSave={() => user!.reload()}
            />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
