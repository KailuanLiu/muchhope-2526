"use client";

/* eslint-disable no-undef */
import React, { useState } from "react";
import styles from "../styles/contact.module.css";

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

  // State for donation form
  const [donationData, setDonationData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    amount: "",
    paymentMethod: "",
  });

  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);
  const [donationStatus, setDonationStatus] = useState<{
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

  // Handler for donation form changes
  const handleDonationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDonationData({ ...donationData, [name]: value });
    // Clear status message when user starts typing again
    if (donationStatus.type) {
      setDonationStatus({ type: null, message: "" });
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

  // Handler for donation form submission
  const handleDonationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (
      !donationData.firstName.trim() ||
      !donationData.lastName.trim() ||
      !donationData.email.trim() ||
      !donationData.amount ||
      !donationData.paymentMethod
    ) {
      setDonationStatus({
        type: "error",
        message: "Please fill in all fields.",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(donationData.email)) {
      setDonationStatus({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setIsSubmittingDonation(true);
    setDonationStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/donation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donationData),
      });

      const data = await response.json();

      if (response.ok) {
        setDonationStatus({
          type: "success",
          message: "Thank you for your donation! We appreciate your support.",
        });
        // Reset form
        setDonationData({
          firstName: "",
          lastName: "",
          email: "",
          amount: "",
          paymentMethod: "",
        });
      } else {
        setDonationStatus({
          type: "error",
          message: data.message || "Something went wrong. Please try again.",
        });
      }
    } catch {
      setDonationStatus({
        type: "error",
        message: "Failed to process donation. Please try again later.",
      });
    } finally {
      setIsSubmittingDonation(false);
    }
  };

  //return the contact form
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.section}>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.description}>
            Have a question or want to get in touch? Send us a message and we&apos;ll respond as soon as possible.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>
                First & Last Name *
              </label>
              <div className={styles.nameRow}>
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
                Email *
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
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Your message..."
                rows={6}
                required
              />
            </div>

            {submitStatus.type && (
              <div
                className={`${styles.statusMessage} ${submitStatus.type === "success" ? styles.success : styles.error}`}
              >
                {submitStatus.message}
              </div>
            )}

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send"}
            </button>
          </form>
        </div>

        <div className={styles.section}>
          <h1 className={styles.title}>Support Our Mission</h1>
          <p className={styles.description}>
            Help us make a difference in the lives of those in need. Your donation supports our mission to provide
            resources for the homeless community.
          </p>

          <form className={styles.form} onSubmit={handleDonationSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="donationFirstName" className={styles.label}>
                First & Last Name *
              </label>
              <div className={styles.nameRow}>
                <input
                  type="text"
                  id="donationFirstName"
                  name="firstName"
                  value={donationData.firstName}
                  onChange={handleDonationChange}
                  className={styles.input}
                  placeholder="First Name"
                  required
                />
                <input
                  type="text"
                  id="donationLastName"
                  name="lastName"
                  value={donationData.lastName}
                  onChange={handleDonationChange}
                  className={styles.input}
                  placeholder="Last Name"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="donationEmail" className={styles.label}>
                Email *
              </label>
              <input
                type="email"
                id="donationEmail"
                name="email"
                value={donationData.email}
                onChange={handleDonationChange}
                className={styles.input}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="amount" className={styles.label}>
                Select Amount *
              </label>
              <select
                id="amount"
                name="amount"
                value={donationData.amount}
                onChange={handleDonationChange}
                className={styles.input}
                required
              >
                <option value="">Choose an amount</option>
                <option value="25">$25</option>
                <option value="50">$50</option>
                <option value="100">$100</option>
                <option value="250">$250</option>
                <option value="500">$500</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="paymentMethod" className={styles.label}>
                Payment Method *
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={donationData.paymentMethod}
                onChange={handleDonationChange}
                className={styles.input}
                required
              >
                <option value="">Select payment method</option>
                <option value="credit">Credit Card</option>
                <option value="debit">Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            {donationStatus.type && (
              <div
                className={`${styles.statusMessage} ${donationStatus.type === "success" ? styles.success : styles.error}`}
              >
                {donationStatus.message}
              </div>
            )}

            <button type="submit" className={styles.submitButton} disabled={isSubmittingDonation}>
              {isSubmittingDonation ? "Processing..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
