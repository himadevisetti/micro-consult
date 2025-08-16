// src/pages/HomePage.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/HomePage.module.css';
import { FormType, RetainerTypeLabel } from '@/types/FormType';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn, i) => {
      console.log(`Button #${i}:`, btn.textContent);
    });
  }, []);

  const handleStart = (templateId: FormType) => {
    navigate(`/builder?template=${templateId}`);
  };

  const RetainerCard = ({ title, templateId }: { title: string; templateId: FormType }) => (
    <button className={styles.retainerCard} onClick={() => handleStart(templateId)}>
      <h3>{title}</h3>
    </button>
  );

  return (
    <main className={styles.landing}>
      <header>
        <h1>Welcome to Expert Snapshot Legal</h1>
        <p>Generate retainer agreements from any template with precision and control.</p>
      </header>

      <section className={styles.templateOptions}>
        <h2>Select a Retainer Type</h2>
        <div className={styles.retainerCardGrid}>
          <RetainerCard title={RetainerTypeLabel[FormType.StandardRetainer]} templateId={FormType.StandardRetainer} />
          <RetainerCard title={RetainerTypeLabel[FormType.IPCounselRetainer]} templateId={FormType.IPCounselRetainer} />
          <RetainerCard title={RetainerTypeLabel[FormType.CustomTemplate]} templateId={FormType.CustomTemplate} />
        </div>
      </section>
    </main>
  );
};

export default HomePage;
