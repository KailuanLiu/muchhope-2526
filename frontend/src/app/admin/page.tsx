"use client";

import { useEffect, useState } from "react";
import { getEvents } from "../../api/events";
import styles from "../../styles/admin.module.css";
import VolunteerNavbar from "../../components/AppNavbar";

export default function AdminPage() {
  const [events, setEvents] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getEvents();
      setEvents(data);
    };
    fetchData();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <VolunteerNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={styles.mainContent}
        style={{
          marginLeft: collapsed ? "80px" : "220px",
        }}
      >
        <div className={styles.leftColumn}>
          <h1 className={styles.title}>Admin Dashboard</h1>

          <div className={styles.profileCard}>
            <div className={styles.profileCircle}></div>
            <button className={styles.editProfileButton}>Edit Profile</button>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.titleRow} />

          <div className={styles.grid}>
            {events.map((event: any) => (
              <div key={event._id} className={styles.card}>
                <div className={styles.image} />

                <div className={styles.cardHeader}>
                  <h2>{event.event_name}</h2>

                  <div className={styles.buttonRow}>
                    <button className={styles.button}>View Volunteers</button>
                    <button className={styles.button}>Edit Event</button>
                  </div>
                </div>

                <p className={styles.datetime}>
                  {event.date} • {event.time}
                </p>

                <div className={styles.avatarRow}>
                  {event.volunteers
                    ?.slice(0, 3)
                    .map((v: any, i: number) => <div key={i} className={styles.avatar}></div>)}

                  {event.volunteers?.length > 3 && (
                    <span className={styles.moreText}>{event.volunteers.length - 3}+ others</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
