"use client";

import React, { useState } from "react";
import styles from "../../styles/adminprofile.module.css";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    aboutMe?: string;
  };
  onSave?: () => Promise<any>;
}

const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

const getPhoneDigits = (value: string): string => value.replace(/\D/g, "");

export default function AdminProfile({ initialData, onSave }: ProfileFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    email: initialData.email,
    phoneNumber: formatPhoneNumber(initialData.phoneNumber),
  });

  const [aboutMe, setAboutMe] = useState(initialData.aboutMe || "");
  const [originalAboutMe, setOriginalAboutMe] = useState(initialData.aboutMe || "");
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutStatus, setAboutStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [isSavingAbout, setIsSavingAbout] = useState(false);

  const [originalData, setOriginalData] = useState(formData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (submitStatus.type) setSubmitStatus({ type: null, message: "" });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phoneNumber: formatted });
    if (submitStatus.type) setSubmitStatus({ type: null, message: "" });
  };

  const handleEdit = () => {
    setOriginalData(formData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setSubmitStatus({ type: null, message: "" });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.phoneNumber.trim()
    ) {
      setSubmitStatus({ type: "error", message: "Please fill in all fields." });
      return;
    }

    const phoneDigits = getPhoneDigits(formData.phoneNumber);
    if (phoneDigits.length !== 10) {
      setSubmitStatus({ type: "error", message: "Please enter a valid 10-digit phone number." });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setOriginalData(formData);
        setSubmitStatus({ type: "success", message: "Profile updated successfully!" });
        setIsEditing(false);
        await onSave?.();
        router.refresh();
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || data.message || "Something went wrong. Please try again.",
        });
      }
    } catch {
      setSubmitStatus({ type: "error", message: "Failed to update profile. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    if (passwordStatus.type) setPasswordStatus({ type: null, message: "" });
  };

  const handleCancelPassword = () => {
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordStatus({ type: null, message: "" });
    setIsChangingPassword(false);
  };

  const handleSaveAbout = async () => {
    setIsSavingAbout(true);
    setAboutStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, aboutMe }),
      });

      const data = await response.json();

      if (response.ok) {
        setOriginalAboutMe(aboutMe);
        setAboutStatus({ type: "success", message: "About Me updated!" });
        setIsEditingAbout(false);
        await onSave?.();
      } else {
        setAboutStatus({ type: "error", message: data.error || "Failed to save." });
      }
    } catch {
      setAboutStatus({ type: "error", message: "Failed to save. Please try again." });
    } finally {
      setIsSavingAbout(false);
    }
  };

  const handleCancelAbout = () => {
    setAboutMe(originalAboutMe);
    setAboutStatus({ type: null, message: "" });
    setIsEditingAbout(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordStatus({ type: "error", message: "Please fill in all password fields." });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordStatus({ type: "error", message: "New password must be at least 8 characters." });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ type: "error", message: "New passwords do not match." });
      return;
    }

    setIsSubmittingPassword(true);
    setPasswordStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordStatus({ type: "success", message: "Password updated successfully!" });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setIsChangingPassword(false);
      } else {
        setPasswordStatus({
          type: "error",
          message: data.error || data.message || "Failed to update password. Please try again.",
        });
      }
    } catch {
      setPasswordStatus({ type: "error", message: "Failed to update password. Please try again later." });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className={styles.formBox}>
      {/* ── Personal Information ── */}
      <div className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Personal Information</h2>
          {!isEditing && (
            <button type="button" className={styles.editButton} onClick={handleEdit}>
              Edit
            </button>
          )}
        </div>

        {/* View mode */}
        {!isEditing && (
          <div className={styles.viewGrid}>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>First Name</span>
              <span className={styles.viewValue}>{formData.firstName}</span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Last Name</span>
              <span className={styles.viewValue}>{formData.lastName}</span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Email</span>
              <span className={styles.viewValue}>{formData.email}</span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Phone Number</span>
              <span className={styles.viewValue}>{formData.phoneNumber}</span>
            </div>
          </div>
        )}

        {/* Edit mode */}
        {isEditing && (
          <form onSubmit={handleSubmit}>
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName" className={styles.label}>
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="First Name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={styles.label}>
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Last Name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Email"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phoneNumber" className={styles.label}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  className={styles.input}
                  placeholder="(123) 456-7890"
                  maxLength={14}
                  required
                />
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.button} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </button>
              <button type="button" className={styles.buttonOutline} onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </button>
            </div>

            {submitStatus.type && (
              <div
                className={`${styles.statusMessage} ${submitStatus.type === "success" ? styles.success : styles.error}`}
              >
                {submitStatus.message}
              </div>
            )}
          </form>
        )}

        {/* Success message shown in view mode after save */}
        {!isEditing && submitStatus.type === "success" && (
          <div className={`${styles.statusMessage} ${styles.success}`}>{submitStatus.message}</div>
        )}
      </div>

      {/* ── About Me ── */}
      <div className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>About Me</h2>
          {!isEditingAbout && (
            <button
              type="button"
              className={styles.editButton}
              onClick={() => {
                setOriginalAboutMe(aboutMe);
                setIsEditingAbout(true);
              }}
            >
              Edit
            </button>
          )}
        </div>

        {!isEditingAbout && <p className={styles.aboutMeText}>{aboutMe || "Tell others a bit about yourself..."}</p>}

        {isEditingAbout && (
          <div>
            <textarea
              className={styles.aboutMeTextarea}
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Tell others a bit about yourself..."
              rows={4}
            />
            <div className={styles.buttonGroup}>
              <button type="button" className={styles.button} onClick={handleSaveAbout} disabled={isSavingAbout}>
                {isSavingAbout ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className={styles.buttonOutline}
                onClick={handleCancelAbout}
                disabled={isSavingAbout}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {aboutStatus.type && (
          <div className={`${styles.statusMessage} ${aboutStatus.type === "success" ? styles.success : styles.error}`}>
            {aboutStatus.message}
          </div>
        )}
      </div>

      {/* ── Security ── */}
      <div id="security" className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Security</h2>
        </div>

        {!isChangingPassword ? (
          <button type="button" className={styles.editButton} onClick={() => setIsChangingPassword(true)}>
            Change Password
          </button>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div className={styles.form}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label htmlFor="currentPassword" className={styles.label}>
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={styles.input}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="newPassword" className={styles.label}>
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={styles.input}
                  placeholder="At least 8 characters"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={styles.input}
                  placeholder="Repeat new password"
                  required
                />
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.button} disabled={isSubmittingPassword}>
                {isSubmittingPassword ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                className={styles.buttonOutline}
                onClick={handleCancelPassword}
                disabled={isSubmittingPassword}
              >
                Cancel
              </button>
            </div>

            {passwordStatus.type && (
              <div
                className={`${styles.statusMessage} ${passwordStatus.type === "success" ? styles.success : styles.error}`}
              >
                {passwordStatus.message}
              </div>
            )}
          </form>
        )}

        {/* Success shown after closing the form */}
        {!isChangingPassword && passwordStatus.type === "success" && (
          <div className={`${styles.statusMessage} ${styles.success}`}>{passwordStatus.message}</div>
        )}
      </div>
    </div>
  );
}
