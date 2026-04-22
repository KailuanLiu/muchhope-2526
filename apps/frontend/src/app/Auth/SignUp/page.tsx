"use client";

import { useSignUp } from "@clerk/nextjs";
import Signup from "../../../components/Signup";

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp();
  return <Signup signUp={signUp} setActive={setActive} isLoaded={isLoaded} />;
}
