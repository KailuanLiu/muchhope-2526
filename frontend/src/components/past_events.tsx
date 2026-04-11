"use client";

import styles from "../styles/past_events.module.css";

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
