"use client";

import { useSignIn } from "@clerk/nextjs/legacy";
import Login from "../../../components/Login";

export default function Page() {
  const { isLoaded, signIn, setActive } = useSignIn();
  return <Login signIn={signIn} setActive={setActive} isLoaded={isLoaded} />;
}
