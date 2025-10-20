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
  onTemplateClick?: () => void;
  scrollable?: boolean;
  mainHeading?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showHomeButton,
  onHomeClick,
  onBackClick,
  onTemplateClick,
  scrollable = false,
  mainHeading,
}) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const shouldShowHomeButton = showHomeButton ?? !isHomePage;

  // detect if we are on Custom Template Preview page
  const isCustomTemplatePreview = location.pathname.startsWith('/preview/custom-template-generate');

  return (
    <div
      className={`${styles.pageWrapper} ${scrollable ? styles.scrollablePage : ''}`}
    >
      <AppHeader
        showHomeButton={shouldShowHomeButton}
        onHomeClick={onHomeClick}
        onBackClick={onBackClick}
        onTemplateClick={isCustomTemplatePreview ? onTemplateClick : undefined}
        mainHeading={mainHeading}
      />
      <main
        className={`${styles.pageContent} ${!isHomePage ? styles.fullWidth : ''}`}
      >
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
