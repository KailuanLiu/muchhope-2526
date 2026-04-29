"use client";

import { useSignIn } from "@clerk/nextjs";
import Login from "../../../components/Login";

export default function Page() {
  const { isLoaded, signIn, setActive } = useSignIn() as any;
  return <Login signIn={signIn} setActive={setActive} isLoaded={isLoaded} />;
}
