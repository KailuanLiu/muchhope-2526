"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import styles from "../../../styles/eventDetail.module.css";
import Navbar from "../../../components/Navbar";

// TODO: Replace with real API call once backend event endpoint is ready
const DUMMY_EVENTS = [
  {
    id: "1",
    title: "Community Meal Service",
    date: "April 5, 2026",
    time: "10:00 AM - 1:00 PM",
    location: "St. James Park, San Jose",
    description: "Help serve hot meals to members of our unhoused community.",
  },
  {
    id: "2",
    title: "Hygiene Kit Distribution",
    date: "April 12, 2026",
    time: "9:00 AM - 12:00 PM",
    location: "Downtown San Jose",
    description: "Assemble and distribute hygiene kits to those in need.",
  },
  {
    id: "3",
    title: "Clothing Drive & Sorting",
    date: "April 19, 2026",
    time: "11:00 AM - 3:00 PM",
    location: "MuchHope Warehouse, San Jose",
    description: "Sort and organize donated clothing items.",
  },
  {
    id: "4",
    title: "Resource Fair",
    date: "April 26, 2026",
    time: "10:00 AM - 2:00 PM",
    location: "City Hall Plaza, San Jose",
    description: "Connect community members with local services.",
  },
];

export default function EventDetailPage() {
  // use with vertical AppNavbar const [collapsed, setCollapsed] = useState(false);
  const [collapsed] = useState(false);
  const { id } = useParams<{ id: string }>();
  const event = DUMMY_EVENTS.find((e) => e.id === id);

  return (
    <div className={styles.pageLayout}>
      {/*use with vertical AppNavbar <Navbar collapsed={collapsed} setCollapsed={setCollapsed} /> */}
      <Navbar />
      <main className={`${styles.mainContent} ${collapsed ? styles.mainContentCollapsed : styles.mainContentExpanded}`}>
        {event ? (
          <>
            <h1 className={styles.title}>{event.title}</h1>
            <div className={styles.body}>
              <div className={styles.imagePlaceholder} />
              <div className={styles.info}>
                <p className={styles.meta}>
                  {event.date} &middot; {event.time}
                </p>
                <p className={styles.meta}>{event.location}</p>
                <p className={styles.description}>{event.description}</p>
              </div>
            </div>
          </>
        ) : (
          <p className={styles.notFound}>Dummy Event {id} not found.</p>
        )}
      </main>
    </div>
  );
}
