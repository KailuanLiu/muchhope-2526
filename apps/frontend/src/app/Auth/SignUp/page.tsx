"use client";

import { useSignUp } from "@clerk/nextjs/legacy";
import Signup from "../../../components/auth/Signup";

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp() as any;
  console.log("useSignUp state:", { isLoaded, signUp: !!signUp, setActive: !!setActive });
  return <Signup signUp={signUp} setActive={setActive} isLoaded={isLoaded} />;
}
