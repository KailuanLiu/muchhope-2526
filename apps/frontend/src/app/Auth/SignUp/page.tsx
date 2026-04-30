"use client";

import { useSignUp } from "@clerk/nextjs/legacy";
import Signup from "../../../components/auth/Signup";

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp();
  return <Signup signUp={signUp} setActive={setActive} isLoaded={isLoaded} />;
}
