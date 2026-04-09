import Navbar from "../components/VolunteerNavbar";
import LandingPage from "../components/LandingPage";

export default function Home() {
  return (
    <main style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Navbar />
      <LandingPage />
    </main>
  );
}
