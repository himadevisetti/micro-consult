// src/pages/HomePage.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/HomePage.module.css';
import { FormType, RetainerTypeLabel } from '@/types/FormType';
import AppHeader from '../components/AppHeader';
import RetainerCard from '../components/RetainerCard';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const handleStart = (templateId: FormType) => {
    navigate(`/builder?template=${templateId}`);
  };

  return (
    <div className={styles.pageWrapper}>
      <AppHeader showHomeButton={false} />
      <main className={styles.landing}>
        <header className={styles.hero}>
          <h1>Welcome to Expert Snapshot Legal</h1>
          <p>Generate retainer agreements from any template with precision and control.</p>
        </header>

        <section className={styles.templateOptions}>
          <h2>Select a Retainer Type</h2>
          <div className={styles.retainerCardGrid}>
            <RetainerCard
              title={RetainerTypeLabel[FormType.StandardRetainer]}
              templateId={FormType.StandardRetainer}
              iconSrc="standard-retainer"
              onStart={handleStart}
            />
            <RetainerCard
              title={RetainerTypeLabel[FormType.IPCounselRetainer]}
              templateId={FormType.IPCounselRetainer}
              iconSrc="ip-counsel"
              onStart={handleStart}
            />
            <RetainerCard
              title={RetainerTypeLabel[FormType.CustomTemplate]}
              templateId={FormType.CustomTemplate}
              iconSrc="custom-template"
              onStart={handleStart}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
