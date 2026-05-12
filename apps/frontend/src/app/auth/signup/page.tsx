"use client";

import { useSignUp } from "@clerk/nextjs";
import Signup from "../../../components/auth/Signup";

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp() as any;
  return <Signup signUp={signUp} setActive={setActive} isLoaded={isLoaded} />;
}
