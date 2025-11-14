// src/pages/HomePage.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/HomePage.module.css';
import { FormType, RetainerTypeLabel } from '@/types/FormType';
import AppHeader from '../components/AppHeader';
import type { IconName } from '@/types/IconName';
import RetainerCard from '../components/RetainerCard';
import { track } from "../../track";

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 🔹 Clear any stale session data when landing on homepage
    sessionStorage.clear();
  }, []);

  // 🔹 Track card click and navigate to form
  const handleStart = async (templateId: FormType) => {
    await track("ui_card_clicked", {
      cardName: RetainerTypeLabel[templateId],
      flowType: templateId,
      customerId: "anonymous", // TODO: Replace with real user ID if available
    });

    navigate(`/form/${templateId}`);
  };

  // 🔹 Core agreement types shown in first card group
  const coreAgreements: { type: FormType; icon: IconName }[] = [
    { type: FormType.StandardRetainer, icon: 'standard-retainer' },
    { type: FormType.IPRightsLicensing, icon: 'ip-rights-licensing' },
    { type: FormType.StartupAdvisory, icon: 'startup-advisory' },
    { type: FormType.EmploymentAgreement, icon: 'employment-agreement' },
  ];

  // 🔹 Specialised agreement types shown in second card group
  const specialisedAgreements: { type: FormType; icon: IconName }[] = [
    { type: FormType.LitigationEngagement, icon: 'litigation-engagement' },
    { type: FormType.RealEstateContract, icon: 'real-estate-contract' },
    { type: FormType.FamilyLawAgreement, icon: 'family-law-agreement' },
    { type: FormType.CustomTemplate, icon: 'custom-template' },
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* 🔹 Move the main heading into AppHeader for consistent layout */}
      <AppHeader showHomeButton={false} mainHeading="Welcome to Expert Snapshot Legal" />

      <main className={styles.landing}>
        <header className={styles.hero}>
          <p>
            Create tailored legal agreements from any template with precision and control
          </p>
        </header>

        <section className={styles.templateOptions}>
          {/* 🔹 Core Agreements Group */}
          <div className={styles.cardGroup}>
            <h3>Core Agreements</h3>
            <div className={styles.retainerCardGrid}>
              {coreAgreements.map(({ type, icon }) => (
                <RetainerCard
                  key={type}
                  title={RetainerTypeLabel[type]}
                  templateId={type}
                  iconSrc={icon}
                  onStart={handleStart}
                />
              ))}
            </div>
          </div>

          {/* 🔹 Specialised Agreements Group */}
          <div className={styles.cardGroup}>
            <h3>Specialised Agreements</h3>
            <div className={styles.retainerCardGrid}>
              {specialisedAgreements.map(({ type, icon }) => (
                <RetainerCard
                  key={type}
                  title={RetainerTypeLabel[type]}
                  templateId={type}
                  iconSrc={icon}
                  onStart={handleStart}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
