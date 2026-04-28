"use client";

import { useSignIn } from "@clerk/nextjs";
import Login from "../../../components/auth/Login";

export default function Page() {
  const { isLoaded, signIn, setActive } = useSignIn();
  return <Login signIn={signIn} setActive={setActive} isLoaded={isLoaded} />;
}
