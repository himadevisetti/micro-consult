// src/components/AppHeader.tsx

import React from 'react';
import styles from '../styles/AppHeader.module.css';

interface AppHeaderProps {
  showHomeButton?: boolean;
  onHomeClick?: () => void;
  onBackClick?: () => void;
  onTemplateClick?: () => void;
  onLogoutClick?: () => void;
  onDashboardClick?: () => void;
  mainHeading?: string;
  userEmail?: string; // 🔹 New prop for email display
}

const AppHeader: React.FC<AppHeaderProps> = ({
  showHomeButton = false,
  onHomeClick,
  onBackClick,
  onTemplateClick,
  onLogoutClick,
  onDashboardClick,
  mainHeading,
  userEmail,
}) => {
  const visibleButtons = [
    onBackClick,
    onTemplateClick,
    onDashboardClick,
    onLogoutClick,
    showHomeButton,
  ].filter(Boolean).length;

  const buttonGroupClass = `${styles.buttonGroup} ${visibleButtons === 1 ? styles.singleButton : ''}`;

  return (
    <header className={styles.header}>
      <div className={styles.logoSlot}>Logo</div>

      {mainHeading && (
        <h1 className={styles.mainHeading}>{mainHeading}</h1>
      )}

      <div className={styles.navRight}>
        <div className={buttonGroupClass}>
          {onBackClick && (
            <button
              type="button"
              className={styles.homeButton}
              onClick={onBackClick}
              aria-label="Back to Form"
            >
              ⬅️ Back
            </button>
          )}

          {onTemplateClick && (
            <button
              type="button"
              className={styles.homeButton}
              onClick={onTemplateClick}
              aria-label="Go to Custom Template"
            >
              📑 Template
            </button>
          )}

          {onDashboardClick && (
            <button
              type="button"
              className={styles.homeButton}
              onClick={onDashboardClick}
              aria-label="Go to Dashboard"
            >
              📊 Dashboard
            </button>
          )}

          {onLogoutClick && (
            <button
              type="button"
              className={styles.homeButton}
              onClick={onLogoutClick}
              aria-label="Logout"
            >
              🚪 Logout
            </button>
          )}

          <button
            type="button"
            className={`${styles.homeButton} ${showHomeButton ? styles.visible : styles.hidden}`}
            onClick={onHomeClick}
            aria-label="Return to Home"
          >
            🏠 Home
          </button>
        </div>

        {/* 🔹 Email aligned below buttons */}
        {userEmail && (
          <span className={styles.userEmail}>{userEmail}</span>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
