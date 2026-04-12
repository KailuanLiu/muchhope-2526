"use client";

import styles from "../styles/memberCard.module.css";

interface MemberCardProps {
  name: string;
  role: string;
  imageUrl?: string;
  onViewProfile: () => void;
  onManage: () => void;
}

export default function MemberCard({
  name,
  role,
  imageUrl,
  onViewProfile,
  onManage,
}: MemberCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <div className={styles.photoContainer}>
          {imageUrl ? (
            <img src={imageUrl} alt={name} className={styles.photo} />
          ) : (
            <div className={styles.photoPlaceholder} />
          )}
        </div>
        <div className={styles.details}>
          <p className={styles.name}>{name}</p>
          <p className={styles.role}>{role}</p>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.button} onClick={onViewProfile}>
          View Profile
        </button>
        <button className={styles.button} onClick={onManage}>
          Manage
        </button>
      </div>
    </div>
  );
}
