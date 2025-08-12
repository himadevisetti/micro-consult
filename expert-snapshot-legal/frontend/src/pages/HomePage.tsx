// src/pages/HomePage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/HomePage.module.css';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn, i) => {
      console.log(`Button #${i}:`, btn.textContent);
    });
  }, []);

  const handleStart = (templateId: string) => {
    navigate(`/builder?template=${templateId}`);
  };

  const RetainerCard = ({ title, templateId }: { title: string; templateId: string }) => (
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
          <RetainerCard title="Standard Legal Retainer" templateId="standard-retainer" />
          <RetainerCard title="IP Counsel Retainer" templateId="ip-counsel-retainer" />
          <RetainerCard title="Custom Template Upload" templateId="custom-upload" />
        </div>
      </section>
    </main>
  );
};

export default HomePage;
