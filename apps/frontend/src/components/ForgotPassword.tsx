"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useClerk } from "@clerk/nextjs";
import AuthLayout from "../app/AuthLayout";
import styles from "../styles/forgotPassword.module.css";

type Stage = "request" | "verify";

type FormState = {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
};

interface ForgotPasswordProps {
  initialStage?: Stage;
}

export default function ForgotPassword({ initialStage = "request" }: ForgotPasswordProps) {
  const { signIn } = useSignIn() as any;
  const { setActive } = useClerk();
  const isLoaded = !!signIn;
  const router = useRouter();
  const [stage, setStage] = useState<Stage>(initialStage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formState, setFormState] = useState<FormState>({
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!signIn) {
      setErrorMessage("Auth is still loading. Please wait a moment and try again.");
      return;
    }

    if (!formState.email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: formState.email,
      });

      const resetPasswordFactor = signInAttempt.supportedFirstFactors?.find(
        (factor: any) => factor.strategy === "reset_password_email_code",
      );

      if (!resetPasswordFactor || !("emailAddressId" in resetPasswordFactor)) {
        setErrorMessage("Password reset by email is not available for this account.");
        return;
      }

      await signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: resetPasswordFactor.emailAddressId,
      });

      setStage("verify");
      setSuccessMessage("If an account exists for this email, you will receive a reset code shortly.");
    } catch (err: any) {
      if (err?.errors?.length) {
        setErrorMessage(err.errors[0]?.message || "Unable to send reset email. Please try again.");
      } else {
        setErrorMessage("Unable to send reset email. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!signIn || !setActive) {
      setErrorMessage("Auth is still loading. Please wait a moment and try again.");
      return;
    }

    if (!formState.code || !formState.password || !formState.confirmPassword) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    if (formState.password !== formState.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: formState.code,
        password: formState.password,
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        setSuccessMessage("Password reset successful. Redirecting...");
        setTimeout(() => router.push("/"), 1200);
      } else {
        setErrorMessage("Reset could not be completed. Please try again.");
      }
    } catch (err: any) {
      if (err?.errors?.length) {
        setErrorMessage(err.errors[0]?.message || "Unable to reset password. Please try again.");
      } else {
        setErrorMessage("Unable to reset password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.pageContainer}>
        <div className={styles.formBox}>
          {stage === "request" ? (
            <form onSubmit={handleRequest}>
              <h2 className={styles.formTitle}>Reset your password</h2>
              <p className={styles.formSubtitle}>Enter your email and we&apos;ll send you a reset code.</p>

              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                type="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />

              {errorMessage && <p className={styles.error}>{errorMessage}</p>}
              {successMessage && <p className={styles.success}>{successMessage}</p>}

              <button className={styles.button} type="submit" disabled={isSubmitting || !isLoaded}>
                {!isLoaded ? "Loading..." : isSubmitting ? "Sending..." : "Send reset code"}
              </button>

              <Link href="/auth/login" className={styles.textLink}>
                Back to login
              </Link>
            </form>
          ) : (
            <form onSubmit={handleReset}>
              <h2 className={styles.formTitle}>Enter your reset code</h2>
              <p className={styles.formSubtitle}>Check your email for the code and choose a new password.</p>

              <label className={styles.label}>Reset code</label>
              <input
                className={styles.input}
                type="text"
                name="code"
                value={formState.code}
                onChange={handleChange}
                placeholder="6-digit code"
                autoComplete="one-time-code"
              />

              <label className={styles.label}>New password</label>
              <input
                className={styles.input}
                type="password"
                name="password"
                value={formState.password}
                onChange={handleChange}
                placeholder="New password"
                autoComplete="new-password"
              />

              <label className={styles.label}>Confirm password</label>
              <input
                className={styles.input}
                type="password"
                name="confirmPassword"
                value={formState.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                autoComplete="new-password"
              />

              {errorMessage && <p className={styles.error}>{errorMessage}</p>}
              {successMessage && <p className={styles.success}>{successMessage}</p>}

              <button className={styles.button} type="submit" disabled={isSubmitting || !isLoaded}>
                {!isLoaded ? "Loading..." : isSubmitting ? "Updating..." : "Reset password"}
              </button>

              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => {
                  setStage("request");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
              >
                Use a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
