"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/signup.module.css";

interface SignupProps {
  signUp: any;
  setActive: any;
  isLoaded: boolean;
}

export default function Signup({ signUp, setActive, isLoaded }: SignupProps) {
  // Clerk constants
  const router = useRouter();
  const [code, setCode] = useState("");
  const [showEmailCode, setShowEmailCode] = useState(false);

  //Saved variables to store input data
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    email: "",
    number: "",
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

    if (!isLoaded) return;

    try {
      // Create user with clerk
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
      });

      // Send verification email
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      // Verification code input
      setShowEmailCode(true);
    } catch (err: any) {
      console.error("Error during sign up:", JSON.stringify(err, null, 2));
    }
  };

  // Handle email verification code submission
  const handleEmailCode = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!isLoaded) return;
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
        console.error("Sign-up attempt not complete:", signUpAttempt.status);
      }
    } catch (err: any) {
      console.error("Error verifying email:", JSON.stringify(err, null, 2));
    }
  };

  // cond. rendering if email verification is needed
  if (showEmailCode) {
    return (
      <div className={styles.pageContainer}>
        <h1 className={styles.pageTitle}>Verify your email</h1>
        <div className={styles.formBox}>
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
            <button className={styles.button} type="submit">
              Verify Email
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Sign Up</h1>

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
          <div className={styles.radioGroup}>
            <label className={styles.label}>Are you over 18?</label>

            <div className={styles.radioOptions}>
              <label className={styles.radioLabel}>
                <input type="radio" name="age" value="Yes" checked={formData.age === "Yes"} onChange={handleChange} />
                Yes
              </label>

              <label className={styles.radioLabel}>
                <input type="radio" name="age" value="No" checked={formData.age === "No"} onChange={handleChange} />
                No
              </label>
            </div>
          </div>
          <button className={styles.button} type="submit">
            Submit
          </button>
          {/* Clerk captcha */}
          <div id="clerk-captcha" />
        </form>
      </div>
    </div>
  );
}
