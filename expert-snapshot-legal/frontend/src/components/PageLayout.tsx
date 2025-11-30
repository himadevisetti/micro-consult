// src/components/PageLayout.tsx
import React from 'react';
import AppHeader from './AppHeader';
import styles from '../styles/PageLayout.module.css';
import { useLocation, useNavigate } from 'react-router-dom';

interface PageLayoutProps {
  children: React.ReactNode;
  showHomeButton?: boolean;
  onHomeClick?: () => void;
  onBackClick?: () => void;
  onTemplateClick?: () => void;
  scrollable?: boolean;
  mainHeading?: string;
  onLogoutClick?: () => void;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showHomeButton,
  onHomeClick,
  onBackClick,
  onTemplateClick,
  scrollable = false,
  mainHeading,
  onLogoutClick,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === '/';
  const shouldShowHomeButton = showHomeButton ?? !isHomePage;

  // Default Home handler: always go back to dashboard, never clear token
  const handleHomeClick = () => {
    navigate('/');
  };

  // detect if we are on Custom Template Preview page
  const isCustomTemplatePreview = location.pathname.startsWith(
    '/preview/custom-template-generate'
  );

  return (
    <div
      className={`${styles.pageWrapper} ${scrollable ? styles.scrollablePage : ''}`}
    >
      <AppHeader
        showHomeButton={shouldShowHomeButton}
        onHomeClick={onHomeClick ?? handleHomeClick}
        onBackClick={onBackClick}
        onTemplateClick={isCustomTemplatePreview ? onTemplateClick : undefined}
        onLogoutClick={onLogoutClick}
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
