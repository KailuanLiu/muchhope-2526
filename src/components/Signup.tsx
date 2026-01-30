"use client";

import { useState } from "react";
import styles from "../styles/signup.module.css";

export default function Signup() {
  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    email: "",
    number: "",
    age: "",
  });
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Sign Up or Login to your Account</h1>

      <div className={styles.formBox}>
        <form onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>Sign up </h2>
          <label className={styles.label}>First & Last Name</label>
          <input
            className={styles.input}
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="First & Last Name"
          />
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
          />
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
          />
          <label className={styles.label}>Phone Number</label>
          <input
            className={styles.input}
            type="tel"
            name="number"
            value={formData.number}
            onChange={handleChange}
            placeholder="Phone Number"
          />
          <label className={styles.label}>Are you over 18?</label>
          <input
            className={styles.radioGroup}
            type="radio"
            id="over18"
            name="age"
            value="Yes"
            checked={formData.age === "Yes"}
            onChange={handleChange}
          />
          <label htmlFor="over18">Yes</label>
          <input
            className={styles.radioGroup}
            type="radio"
            id="under18"
            name="age"
            value="No"
            checked={formData.age === "No"}
            onChange={handleChange}
          />
          <label htmlFor="under18">No</label>
          <button className={styles.button} type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
