"use client";

// src/components/ConfirmDeleteModal.tsx
// Generic confirmation dialog used when an admin clicks Delete on an event.

import styles from "../styles/adminPanel.module.css";

interface ConfirmDeleteModalProps {
  /** Event title shown in the prompt */
  title: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({ title, isDeleting, onConfirm, onCancel }: ConfirmDeleteModalProps) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.confirmTitle}>Delete event?</h2>
        <p className={styles.confirmBody}>
          <strong>{title}</strong> will be permanently deleted. This cannot be undone.
        </p>
        <div className={styles.confirmActions}>
          <button className={styles.confirmDeleteButton} disabled={isDeleting} onClick={onConfirm} type="button">
            {isDeleting ? "Deleting..." : "Yes, delete"}
          </button>
          <button className={styles.cancelButton} disabled={isDeleting} onClick={onCancel} type="button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
