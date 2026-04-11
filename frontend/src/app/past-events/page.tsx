import Navbar from "../../components/Navbar";
import PastEvent from "../../components/past_events";
import styles from "../../styles/past_events_page.module.css";

const events = [
  { name: "Event 1", image: "/placeholder.jpg", desc: "This is a description for event 1." },
  { name: "Event 2", image: "/placeholder.jpg", desc: "This is a description for event 2." },
];

export default function PastEvents() {
  return (
    <main>
      <Navbar />
      <div className={styles.pastEventsContainer}>
        <img src="/placeholder.jpg" alt="banner" className={styles.pastEventBanner} />
        <h1 className={styles.pastEventsView}> View Our Past Events! </h1>
      </div>

      <div className={styles.pastEventsList}>
        {events.map((event, index) => (
          <PastEvent key={index} event={event} />
        ))}
      </div>
    </main>
  );
}
