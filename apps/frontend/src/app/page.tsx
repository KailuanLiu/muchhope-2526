"use client";

import LandingPage from "../components/LandingPage";
import AuthLayout from "./AuthLayout";

export default function Home() {
  return (
    <AuthLayout>
      <LandingPage />
    </AuthLayout>
  );
}
