"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/signup.module.css";
import AuthLayout from "@/app/AuthLayout";

type ClerkError = {
  code?: string;
  longMessage?: string;
  message?: string;
  meta?: {
    name?: string;
  };
};

interface SignupProps {
  signUp: any;
  setActive: any;
  isLoaded: boolean;
}

type ErrorField = "email" | "password" | "verificationCode" | "form";

type ClerkErrorConfig = {
  field: ErrorField;
  message: string;
};

const SIGN_UP_ERROR_MESSAGES: Record<string, ClerkErrorConfig> = {
  form_identifier_exists: {
    field: "email",
    message: "An account with this email already exists. Try signing in instead.",
  },
  form_password_length_too_short: {
    field: "password",
    message: "Password must be at least 8 characters long.",
  },
  form_password_length_too_long: {
    field: "password",
    message: "Password is too long. Please choose a shorter password.",
  },
  form_password_no_lowercase: {
    field: "password",
    message: "Password must contain at least one lowercase letter.",
  },
  form_password_no_uppercase: {
    field: "password",
    message: "Password must contain at least one uppercase letter.",
  },
  form_password_no_number: {
    field: "password",
    message: "Password must contain at least one number.",
  },
  form_password_no_special_char: {
    field: "password",
    message: "Password must contain at least one special character.",
  },
  form_password_not_strong_enough: {
    field: "password",
    message: "Password is not strong enough. Choose a stronger password.",
  },
  form_password_pwned: {
    field: "password",
    message: "This password has appeared in a known data breach. Choose a different password.",
  },
  form_password_compromised: {
    field: "password",
    message: "This password may be compromised. Choose a different password.",
  },
  form_param_format_invalid: {
    field: "email",
    message: "Please enter a valid email address.",
  },
  captcha_verification_required: {
    field: "form",
    message: "Complete the CAPTCHA challenge and try again.",
  },
  form_param_missing: {
    field: "form",
    message: "Please fill out all required fields.",
  },
};

const VERIFY_ERROR_MESSAGES: Record<string, ClerkErrorConfig> = {
  form_code_incorrect: {
    field: "verificationCode",
    message: "The verification code is incorrect. Try again.",
  },
  form_identifier_not_found: {
    field: "verificationCode",
    message: "We could not find a pending email verification for this account.",
  },
  form_param_missing: {
    field: "verificationCode",
    message: "Enter the verification code to continue.",
  },
  captcha_verification_required: {
    field: "verificationCode",
    message: "Complete the CAPTCHA challenge and try again.",
  },
};

function getClerkErrorMessage(
  clerkError: ClerkError | undefined,
  errorMessages: Record<string, ClerkErrorConfig>,
  fallbackMessage: string,
): ClerkErrorConfig {
  if (!clerkError) {
    return { field: "form", message: fallbackMessage };
  }

  if (clerkError.code && errorMessages[clerkError.code]) {
    return errorMessages[clerkError.code];
  }

  if (clerkError.code === "form_param_value_invalid" && clerkError.meta?.name === "email_address") {
    return { field: "email", message: "Please enter a valid email address." };
  }

  return {
    field: "form",
    message: clerkError.longMessage || clerkError.message || fallbackMessage,
  };
}

function getClerkErrorMessages(
  err: any,
  errorMessages: Record<string, ClerkErrorConfig>,
  fallbackMessage: string,
): ClerkErrorConfig[] {
  const clerkErrors = err?.errors as ClerkError[] | undefined;

  if (!clerkErrors?.length) {
    return [{ field: "form", message: fallbackMessage }];
  }

  return clerkErrors.map((clerkError) => getClerkErrorMessage(clerkError, errorMessages, fallbackMessage));
}

export default function Signup({ signUp, setActive, isLoaded }: SignupProps) {
  // Clerk constants
  const router = useRouter();
  const [code, setCode] = useState("");
  const [showEmailCode, setShowEmailCode] = useState(false);
  const [formError, setFormError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verificationCodeError, setVerificationCodeError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  //Saved variables to store input data
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    email: "",
    age: "",
  });

  //Helper functions to handle change for inputs in form
  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  //Helper function to avoid needing browser reload to submit form
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    setFormError("");
    setEmailError("");
    setPasswordError("");

    if (!isLoaded) {
      setFormError("Auth is still loading. Please try again in a moment.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create user with clerk
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.name,
      });

      // Send verification email
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      // Verification code input
      setShowEmailCode(true);
    } catch (err: any) {
      const clerkErrors = getClerkErrorMessages(
        err,
        SIGN_UP_ERROR_MESSAGES,
        "An error occurred during sign up. Please try again.",
      );

      const nextEmailErrors = clerkErrors.filter(({ field }) => field === "email").map(({ message }) => message);
      const nextPasswordErrors = clerkErrors.filter(({ field }) => field === "password").map(({ message }) => message);
      const nextFormErrors = clerkErrors.filter(({ field }) => field === "form").map(({ message }) => message);

      setEmailError(nextEmailErrors.join(" "));
      setPasswordError(nextPasswordErrors.join(" "));
      setFormError(nextFormErrors.join(" "));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle email verification code submission
  const handleEmailCode = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    setVerificationCodeError("");

    if (!isLoaded) {
      setVerificationCodeError("Auth is still loading. Please try again in a moment.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Verify email w code
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // Set session as active if verify is successful
      if (signUpAttempt.status === "complete") {
        await setActive({
          session: signUpAttempt.createdSessionId,
        });

        // Go back to home page
        router.push("/");
      } else {
        setVerificationCodeError("Verification could not be completed. Please try again.");
      }
    } catch (err: any) {
      const clerkErrors = getClerkErrorMessages(
        err,
        VERIFY_ERROR_MESSAGES,
        "An error occurred while verifying your email. Please try again.",
      );

      const nextVerificationErrors = clerkErrors
        .filter(({ field }) => field === "verificationCode" || field === "form")
        .map(({ message }) => message);

      setVerificationCodeError(nextVerificationErrors.join(" "));
    } finally {
      setIsSubmitting(false);
    }
  };

  // cond. rendering if email verification is needed
  if (showEmailCode) {
    return (
      <div className={styles.pageContainer}>
        <h1 className={styles.pageTitle}>Verify your email</h1>
        <form onSubmit={handleEmailCode}>
          <h2 className={styles.formTitle}>Enter verification code</h2>
          <p>A verification code has been sent to {formData.email}</p>
          <label className={styles.label}>Verification Code</label>
          <input
            className={styles.input}
            type="text"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
            inputMode="numeric"
          />
          {verificationCodeError && <p className={styles.error}>{verificationCodeError}</p>}
          <button className={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify Email"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <AuthLayout>
      <div className={styles.pageContainer}>
        <div className={styles.card}>
          <div className={styles.leftPanel}>
            <img src="/Signup.jpg" alt="Much Hope" className={styles.image} />
          </div>
          <div className={styles.rightPanel}>
            <form onSubmit={handleSubmit}>
              <h2 className={styles.formTitle}>Sign up </h2>
              <label className={styles.label}>Name</label>
              <input
                className={styles.input}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
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
              {emailError && <p className={styles.error}>{emailError}</p>}

              <label className={styles.label}>Password</label>
              <input
                className={styles.input}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
              />

              <label className={styles.label}>Confirm Password</label>
              <input
                className={styles.input}
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
              />

              {passwordError && <p className={styles.error}>{passwordError}</p>}
              <div className={styles.radioGroup}>
                <label className={styles.label}>Are you over 18?</label>

                <div className={styles.radioOptions}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="age"
                      value="Yes"
                      checked={formData.age === "Yes"}
                      onChange={handleChange}
                    />
                    Yes
                  </label>

                  <label className={styles.radioLabel}>
                    <input type="radio" name="age" value="No" checked={formData.age === "No"} onChange={handleChange} />
                    No
                  </label>
                </div>
              </div>
              <button className={styles.button} type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Sign Up"}
              </button>
              {formError && <p className={styles.error}>{formError}</p>}
              {/* Clerk captcha */}
              <div id="clerk-captcha" />
            </form>
          </div>{" "}
          {/* rightPanel */}
        </div>{" "}
        {/* card */}
      </div>
    </AuthLayout>
  );
}
