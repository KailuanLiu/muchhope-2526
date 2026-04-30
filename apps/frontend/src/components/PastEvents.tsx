"use client";

//src/components/pastevents.tsx
import styles from "../styles/pastEvents.module.css";

type Event = {
  name: string;
  image: string;
  desc: string;
};

export default function PastEvent({ event }: { event: Event }) {
  return (
    <div className={styles.pastEventContainer}>
      <img src={event.image} alt="placeholder" className={styles.pastEventImage} />

      <div className={styles.pastEventInfo}>
        <h1 className={styles.pastEventTitle}> {event.name}</h1>
        <p className={styles.pastEventDesc}>{event.desc}</p>
      </div>
    </div>
  );
}
