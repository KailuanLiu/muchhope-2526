import Contact from "../../components/Contact";
import Navbar from "../../components/Navbar";

export default function ContactUsPage() {
  return (
    <main style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Navbar />
      <Contact />
    </main>
  );
}
