"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../styles/login.module.css";
import AuthLayout from "../app/AuthLayout";

interface LoginProps {
  signIn: any;
  setActive: any;
  isLoaded: boolean;
}

export default function Login({ signIn, setActive, isLoaded }: LoginProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();
  const [error, setError] = useState("");

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");

    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
        });

        router.push("/");
      } else {
        console.error("Sign-in attempt not complete:", signInAttempt.status);
        setError("Sign-in could not be completed. Please try again.");
      }
    } catch (err: any) {
      console.error("Error during sign in:", JSON.stringify(err, null, 2));

      if (err.errors && err.errors[0]) {
        setError(err.errors[0].message);
      } else {
        setError("An error occurred during sign in. Please try again.");
      }
    }
  };

  return (
    <AuthLayout>
      <div className={styles.pageContainer}>
        {/* <h1 className={styles.pageTitle}>Sign Up or Login to your Account</h1> */}
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

            <Link href="/forgot-password" className={styles.textLink}>
              Forgot password?
            </Link>

            <Link href="/Auth/SignUp" className={styles.textLink}>
              Create Account
            </Link>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
