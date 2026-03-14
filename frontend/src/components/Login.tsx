"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/login.module.css";

interface LoginProps {
  signIn: any;
  setActive: any;
  isLoaded: boolean;
}

export default function Login({ signIn, setActive, isLoaded }: LoginProps) {
  //Saved variables to store input data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();
  const [error, setError] = useState("");

  //Helper functions to handle change for inputs in form
  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  //Helper function to avoid needing browser reload to submit form
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");

    if (!isLoaded) return;
    try {
      // Sign in the user with Clerk
      const signInAttempt = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      // Set session as active if sign in is complete
      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
        });

        // Go to home
        router.push("/");
      } else {
        // Find error
        console.error("Sign-in attempt not complete:", signInAttempt.status);
        setError("Sign-in could not be completed. Please try again.");
      }
    } catch (err: any) {
      console.error("Error during sign in:", JSON.stringify(err, null, 2));

      // Extract and display the error message
      if (err.errors && err.errors[0]) {
        setError(err.errors[0].message);
      } else {
        setError("An error occurred during sign in. Please try again.");
      }
    }
  };

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
          {error && <p className={styles.error}>{error}</p>}
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
