// src/components/PageLayout.tsx

import React from 'react';
import AppHeader from './AppHeader';
import styles from '../styles/PageLayout.module.css';
import { useLocation } from 'react-router-dom';

interface PageLayoutProps {
  children: React.ReactNode;
  showHomeButton?: boolean;
  onHomeClick?: () => void;
  onBackClick?: () => void;
  scrollable?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showHomeButton,
  onHomeClick,
  onBackClick,
  scrollable = false,
}) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const shouldShowHomeButton = showHomeButton ?? !isHomePage;

  return (
    <div
      className={`${styles.pageWrapper} ${scrollable ? styles.scrollablePage : ''
        }`}
    >
      <AppHeader
        showHomeButton={shouldShowHomeButton}
        onHomeClick={onHomeClick}
        onBackClick={onBackClick}
      />
      <main
        className={`${styles.pageContent} ${!isHomePage ? styles.fullWidth : ''
          }`}
      >
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
