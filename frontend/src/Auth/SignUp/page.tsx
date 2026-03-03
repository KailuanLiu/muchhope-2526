import { useSignUp } from "@clerk/nextjs";
import Signup from "../../components/Signup";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();

  // Pass the Clerk functions as props to your Signup component
  return <Signup signUp={signUp} setActive={setActive} isLoaded={isLoaded} />;
}
