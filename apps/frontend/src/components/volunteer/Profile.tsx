"use client";

import React, { useState, useEffect } from "react";
import styles from "../../styles/profile.module.css";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    isAdult: boolean;
  };
  onSave?: () => Promise<any>;
}

// Format phone number as (XXX) XXX-XXXX
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

// Extract only digits from phone number
const getPhoneDigits = (value: string): string => {
  return value.replace(/\D/g, "");
};

export default function ProfileForm({ initialData, onSave }: ProfileFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    email: initialData.email,
    phoneNumber: formatPhoneNumber(initialData.phoneNumber),
    isAdult: initialData.isAdult,
  });

  // Sync when Clerk finishes loading
  useEffect(() => {
    setFormData({
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      phoneNumber: formatPhoneNumber(initialData.phoneNumber),
      isAdult: initialData.isAdult,
    });
    setOriginalData({
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      phoneNumber: formatPhoneNumber(initialData.phoneNumber),
      isAdult: initialData.isAdult,
    });
  }, [initialData.email, initialData.firstName, initialData.lastName, initialData.phoneNumber]);

  const [originalData, setOriginalData] = useState(formData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: "" });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<any>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phoneNumber: formatted });
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: "" });
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<any>) => {
    setFormData({ ...formData, isAdult: e.target.value === "adult" });
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: "" });
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setSubmitStatus({ type: null, message: "" });
  };

  const handleSubmit = async (e: React.FormEvent<any>) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phoneNumber.trim()) {
      setSubmitStatus({
        type: "error",
        message: "Please fill in all fields.",
      });
      return;
    }

    const phoneDigits = getPhoneDigits(formData.phoneNumber);
    if (phoneDigits.length !== 10) {
      setSubmitStatus({
        type: "error",
        message: "Please enter a valid 10-digit phone number.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setOriginalData(formData);
        setSubmitStatus({ type: "success", message: "Profile updated successfully!" });
        await onSave?.();
        router.refresh();
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || data.message || "Something went wrong. Please try again.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Failed to update profile. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formBox}>
      <form className={styles.form} onSubmit={handleSubmit}>
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
          <span className={styles.label}>Age Status</span>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="ageStatus"
                value="adult"
                checked={formData.isAdult === true}
                onChange={handleRadioChange}
              />
              18 and up
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="ageStatus"
                value="minor"
                checked={formData.isAdult === false}
                onChange={handleRadioChange}
              />
              Under 18
            </label>
          </div>
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

        {submitStatus.type && (
          <div className={`${styles.statusMessage} ${submitStatus.type === "success" ? styles.success : styles.error}`}>
            {submitStatus.message}
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button type="button" className={styles.button} onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
