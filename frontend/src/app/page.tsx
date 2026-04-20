// import Navbar from "../components/Navbar";
import LandingPage from "../components/LandingPage";
// import About from "../components/About";

export default function Home() {
  return (
    <main style={{ display: "flex", minHeight: "100vh" }}>
      {/* <Navbar /> */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <LandingPage />
      </div>
    </main>
  );
}
