"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useClerk, useAuth } from "@clerk/nextjs";
import { useSignIn } from "@clerk/nextjs/legacy";
import styles from "@/styles/login.module.css";
import AuthLayout from "@/app/AuthLayout";

export default function Login() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { signIn } = useSignIn() as any;
  const { setActive } = useClerk();
  const isLoaded = !!signIn;
  const router = useRouter();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoaded && isSignedIn) {
      router.push("/");
    }
  }, [authLoaded, isSignedIn]);

  if (!authLoaded || isSignedIn) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    if (!isLoaded || !signIn || !setActive) {
      setError("Authentication is still loading. Please try again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const signInAttempt = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        window.location.href = "/";
      } else {
        setError("Sign-in could not be completed. Please try again.");
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.message || "";
      if (message.toLowerCase().includes("already signed in")) {
        router.push("/");
        return;
      }
      setError(message || "An error occurred during sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.imagePanel}>
            <div className={styles.imageOverlay}>
              <h2 className={styles.brandTitle}>Much Hope</h2>
              <p className={styles.brandText}>Supporting the homeless community with compassion, dignity, and care.</p>
            </div>
          </div>

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

              <button className={styles.button} type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Login"}
              </button>
            </form>

            <div className={styles.links}>
              <Link href="/forgot-password" className={styles.textLink}>
                Forgot password?
              </Link>
              <p className={styles.signupText}>
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className={styles.textLink}>
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
