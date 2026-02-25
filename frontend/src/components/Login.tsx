"use client";

import { useState } from "react";
import styles from "../styles/login.module.css";

export default function Login() {
  //Helper functions to handle change for inputs in form
  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  //Helper function to avoid needing browser reload to submit form
  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // console.log("Form submitted:", formData);
  };

  //Saved variables to store input data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Sign Up or Login to your Account</h1>
      <div className={styles.formBox}>
        <form onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>Login</h2>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
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
          <button className={styles.button} type="submit">
            Login
          </button>
          <a href="" className={styles.textLink}>
            Forgot password?
          </a>
          <a href="./signup" className={styles.textLink}>
            Create Account
          </a>
        </form>
      </div>
    </div>
  );
}
