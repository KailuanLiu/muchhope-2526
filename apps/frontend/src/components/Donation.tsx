// frontend/src/components/Donation.tsx
"use client";

import React, { useMemo, useState } from "react";
import AuthLayout from "@/app/AuthLayout";
import styles from "@/styles/donation.module.css";

const acceptedItems = [
  {
    title: "Clothing",
    description: "Gently-used jackets, sweaters, socks, shoes, and seasonal layers.",
  },
  {
    title: "Non-Perishable Food",
    description: "Canned goods, granola bars, peanut butter, instant meals, bottled water.",
  },
  {
    title: "Hygiene Products",
    description: "Toothbrushes, toothpaste, soap, shampoo, deodorant, feminine products.",
  },
  {
    title: "Bedding & Warmth",
    description: "Blankets, sleeping bags, hand warmers, beanies, gloves.",
  },
  {
    title: "Backpacks & Bags",
    description: "Durable backpacks and tote bags to help carry essentials.",
  },
  {
    title: "School & Job Supplies",
    description: "Notebooks, pens, resume folders, simple stationery.",
  },
];

interface DonationRecord {
  id: string;
  name: string;
  event: string;
  item: string;
  quantity: number;
}

const sampleDonations: DonationRecord[] = [
  { id: "d1", name: "Ansita Agrawal", event: "Winter Outreach", item: "Wool blankets", quantity: 12 },
  { id: "d2", name: "Tyler Kim", event: "Saturday Meal Service", item: "Canned soup", quantity: 48 },
  { id: "d3", name: "Briana Kirkman", event: "Hygiene Drive", item: "Toothbrush kits", quantity: 60 },
  { id: "d4", name: "Hayes Lao", event: "Back-to-School Drive", item: "Backpacks", quantity: 20 },
  { id: "d5", name: "Kayla Tran", event: "Saturday Meal Service", item: "Bottled water (cases)", quantity: 8 },
  { id: "d6", name: "Caleb So", event: "Winter Outreach", item: "Fleece jackets", quantity: 15 },
];

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

export default function Donation() {
  const [eventFilter, setEventFilter] = useState<string>("All");

  const eventOptions = useMemo(() => {
    const unique = Array.from(new Set(sampleDonations.map((d) => d.event)));
    return ["All", ...unique];
  }, []);

  const filteredDonations = useMemo(() => {
    if (eventFilter === "All") return sampleDonations;
    return sampleDonations.filter((d) => d.event === eventFilter);
  }, [eventFilter]);

  const totalQuantity = filteredDonations.reduce((sum, d) => sum + d.quantity, 0);

  return (
    <AuthLayout>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                Donate Items.
                <br />
                <em>Give Hope.</em>
              </h1>
              <p className={styles.heroSubtitle}>
                Much Hope accepts donations of essential items for our outreach to the homeless community in San Jose.
                Drop off goods at any of our events, or contact us to coordinate a pickup.
              </p>
            </div>
            <div className={styles.heroImage}>
              <img src="/cat-placeholder.jpg" alt="" />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionLabel}>What We Accept</p>
          <h2 className={styles.sectionTitle}>Items the community needs most</h2>
          <div className={styles.acceptedGrid}>
            {acceptedItems.map((item) => (
              <article key={item.title} className={styles.acceptedCard}>
                <h3 className={styles.acceptedTitle}>{item.title}</h3>
                <p className={styles.acceptedDesc}>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.listHeader}>
            <div>
              <p className={styles.sectionLabel}>Recent Donations</p>
              <h2 className={styles.sectionTitle}>Recent contributions from our community</h2>
            </div>
            <span className={styles.countBadge}>{filteredDonations.length}</span>
          </div>

          <div className={styles.filters}>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className={styles.filterSelect}
              aria-label="Filter by event"
            >
              {eventOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "All" ? "All Events" : opt}
                </option>
              ))}
            </select>
            <span className={styles.totalLabel}>{totalQuantity} items donated</span>
          </div>

          <div className={styles.list}>
            {filteredDonations.length === 0 ? (
              <div className={styles.emptyState}>No donations yet for this event.</div>
            ) : (
              filteredDonations.map((donation) => (
                <article key={donation.id} className={styles.card}>
                  <div className={styles.cardLeft}>
                    <div className={styles.avatar}>{getInitials(donation.name)}</div>
                    <div className={styles.cardContent}>
                      <h3 className={styles.donorName}>{donation.name}</h3>
                      <p className={styles.eventName}>{donation.event}</p>
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <div className={styles.itemBlock}>
                      <span className={styles.itemLabel}>Donation Item</span>
                      <span className={styles.itemValue}>{donation.item}</span>
                    </div>
                    <div className={styles.quantityBlock}>
                      <span className={styles.itemLabel}>Quantity</span>
                      <span className={styles.quantityValue}>{donation.quantity}</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </AuthLayout>
  );
}
