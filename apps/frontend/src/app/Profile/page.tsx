"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import AuthLayout from "../AuthLayout";
import ProfileForm from "../../components/volunteer/Profile";
import UpcomingShifts from "../../components/UpcomingShifts";
import styles from "../../styles/profile.module.css";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  const handleEditPhoto = () => {
    // TODO: Handle photo upload
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
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <span className={styles.activeBreadcrumb}>My Profile</span>
        </div>
        <h1 className={styles.pageTitle}>My Profile</h1>
        <div className={styles.profileHeader}>
          <div className={styles.photoContainer}>
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className={styles.profilePhoto} />
            ) : (
              <div className={styles.photoPlaceholder}>
                <span className={styles.photoInitials}>
                  {firstName.charAt(0)}
                  {lastName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className={styles.headerInfo}>
            <h2 className={styles.userName}>
              {firstName} {lastName}
            </h2>
            <p className={styles.userEmail}>{email}</p>
          </div>
          <button className={styles.editPhotoButton} onClick={handleEditPhoto}>
            Edit Photo
          </button>
        </div>

        <div className={styles.columnsWrapper}>
          <div className={styles.leftColumn}>
            <ProfileForm
              initialData={{
                firstName: firstName,
                lastName: lastName,
                email: email,
                phoneNumber: (user?.publicMetadata?.phoneNumber as string) ?? "",
                isAdult: (user?.publicMetadata?.isAdult as boolean) ?? false,
              }}
              onSave={() => user!.reload()}
            />
          </div>
          <div className={styles.rightColumn}>
            <UpcomingShifts volunteerEmail={email} />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
