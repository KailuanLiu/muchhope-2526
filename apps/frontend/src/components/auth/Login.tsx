"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/login.module.css";
import AuthLayout from "@/app/AuthLayout";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      <div className={styles.page}>
        <div className={styles.card}>
          {/* IMAGE PANEL FIRST (LEFT SIDE) */}
          <div className={styles.imagePanel}>
            <div className={styles.imageOverlay}>
              <h2 className={styles.brandTitle}>Much Hope</h2>
              <p className={styles.brandText}>Supporting the homeless community with compassion, dignity, and care.</p>
            </div>
          </div>

          {/* FORM PANEL SECOND (RIGHT SIDE) */}
          <div className={styles.formPanel}>
            <div className={styles.formHeader}>
              <h1 className={styles.title}>Login</h1>
              <p className={styles.subtitle}>Welcome back to Much Hope</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <input
                  id="email"
                  className={styles.input}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <input
                  id="password"
                  className={styles.input}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button className={styles.button} type="submit">
                Login
              </button>
            </form>

            <div className={styles.links}>
              <Link href="/forgot-password" className={styles.textLink}>
                Forgot password?
              </Link>

              <p className={styles.signupText}>
                Don&apos;t have an account?{" "}
                <Link href="/Auth/SignUp" className={styles.textLink}>
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
