"use client";

import styles from "../styles/eventInfoPopUp.module.css";

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  imageUrl?: string;
}

interface MoreInfoModalProps {
  event: EventData;
  onClose: () => void;
  onRegister: () => void;
}

export default function EventInfoPopUp({ event, onClose, onRegister }: MoreInfoModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.title}>{event.title}</h2>
        <div className={styles.body}>
          <div className={styles.imagePlaceholder}></div>
          <div className={styles.info}>
            <div className={styles.metaRow}>
              <span>
                {event.date}, {event.time}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span>{event.location}</span>
            </div>
            <p className={styles.description}>{event.description}</p>
            <button className={styles.registerButton} onClick={onRegister}>
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
