// src/components/AppHeader.tsx

import React from 'react';
import styles from '../styles/AppHeader.module.css';

interface AppHeaderProps {
  showHomeButton?: boolean;
  onHomeClick?: () => void;
  onBackClick?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  showHomeButton = false,
  onHomeClick,
  onBackClick,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.logoSlot}>Logo</div>
      <div className={styles.navRight}>
        {onBackClick && (
          <button
            className={styles.homeButton}
            onClick={onBackClick}
            aria-label="Back to Form"
          >
            ⬅️ Back
          </button>
        )}
        <button
          className={`${styles.homeButton} ${showHomeButton ? styles.visible : styles.hidden}`}
          onClick={onHomeClick}
          aria-label="Return to Home"
        >
          🏠 Home
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
