"use client";

import React, { useState } from "react";
import styles from "../styles/contact.module.css";
import AuthLayout from "@/app/AuthLayout";

export default function Contact() {
  //variable to store form data inputted by the user
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  //function to handle changes in the form data when user types in the form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear status message when user starts typing again
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: "" });
    }
  };

  //function to handle the submission of the form data
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus({
        type: "error",
        message: "Please fill in all fields.",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Thank you for your message! We'll get back to you soon.",
        });
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          message: "",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.message || "Something went wrong. Please try again.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Failed to send message. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  //return the contact form
  return (
    <AuthLayout>
      <div className={styles.page}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Get in Touch</h1>
          <p className={styles.description}>
            Have a question or want to get in touch? Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className={styles.contactCard}>
          <div className={styles.infoPanel}>
            <div className={styles.infoContent}>
              <h2 className={styles.infoTitle}>Contact Information</h2>
              <p className={styles.infoText}>
                We&apos;re here to support volunteers, donors, and community partners. Reach out and we&apos;ll be happy
                to help.
              </p>

              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email</span>
                  <span className={styles.infoValue}>h4imuchhope@gmail.com</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Phone</span>
                  <span className={styles.infoValue}>(xxx) xxx-xxx</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Location</span>
                  <span className={styles.infoValue}>San Jose, California</span>
                </div>
              </div>
            </div>

            <div className={styles.infoAccent}></div>
          </div>

          <div className={styles.formPanel}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.nameRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName" className={styles.label}>
                    First Name*
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
                    Last Name*
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
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email*
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>
                  Message*
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={styles.textarea}
                  placeholder="Write your message here..."
                  rows={7}
                  required
                />
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

              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
