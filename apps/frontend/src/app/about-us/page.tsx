import Navbar from "../../components/Navbar";
import About from "../../components/About";
import Contact from "../../components/Contact";
import styles from "../../styles/about.module.css";

export default function AboutUs() {
  return (
    <main>
      <Navbar />
      <About />
      <div className={styles.aboutBanner}></div>
      <Contact />
    </main>
  );
}
