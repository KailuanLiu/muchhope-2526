import Navbar from "../../components/Navbar";
import About from "../../components/About";
import styles from "../../styles/about.module.css";

export default function AboutUs() {
  return (
    <main>
      <Navbar />
      <About />
      <div className={styles.aboutBanner}></div>
    </main>
  );
}
