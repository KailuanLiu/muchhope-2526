"use client";

import { useState } from "react";
import Navbar from "../../../components/Navbar";
import styles from "../../../styles/upcomingEvents.module.css";
import EventCard from "../../../components/EventCard";

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
  {
    id: "5",
    title: "Build a House",
    date: "April 28, 2026",
    time: "10:00 AM - 8:00 PM",
    location: "The Projects, San Jose",
    description: "Build affordable housing.",
  },
];

export default function UpcomingEventsPage() {
  // user with vertical AppNavbar const [collapsed, setCollapsed] = useState(false);
  const [collapsed] = useState(false);

  return (
    <div className={styles.pageLayout}>
      {/* use with vertical AppNavbar <Navbar collapsed={collapsed} setCollapsed={setCollapsed} /> */}
      <Navbar />
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Explore Our Upcoming Events!</h1>
      </div>
      <main className={`${styles.mainContent} ${collapsed ? styles.mainContentCollapsed : styles.mainContentExpanded}`}>
        <div className={styles.eventGrid}>
          {DUMMY_EVENTS.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </main>
    </div>
  );
}
