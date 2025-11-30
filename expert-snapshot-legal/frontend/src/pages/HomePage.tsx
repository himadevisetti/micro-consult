// src/pages/HomePage.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/HomePage.module.css';
import { FormType, RetainerTypeLabel } from '@/types/FormType';
import AppHeader from '../components/AppHeader';
import type { IconName } from '@/types/IconName';
import RetainerCard from '../components/RetainerCard';
import ShimmerCard from '../components/ShimmerCard';
import { track } from "../../track";
import { preloadIcons } from '../utils/preloadIcons';
import { getDecodedToken } from '@/utils/authToken';

const HomePage = () => {
  const navigate = useNavigate();
  const [iconsReady, setIconsReady] = useState(false);

  useEffect(() => {
    // 🔹 Preload all icons before rendering cards
    preloadIcons([
      'standard-retainer',
      'ip-rights-licensing',
      'startup-advisory',
      'employment-agreement',
      'litigation-engagement',
      'real-estate-contract',
      'family-law-agreement',
      'custom-template',
    ]).then(() => setIconsReady(true));
  }, []);

  // 🔹 Track card click and navigate to form
  const handleStart = async (templateId: FormType) => {
    const decoded = getDecodedToken();
    await track("ui_card_clicked", {
      cardName: RetainerTypeLabel[templateId],
      flowType: templateId,
      customerId: decoded?.customerId ?? "anonymous", // 🔹 Use decoded customerId if available
    });

    navigate(`/form/${templateId}`);
  };

  // 🔹 Logout handler clears token and redirects to login
  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
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
      <AppHeader
        showHomeButton={false}
        mainHeading="Welcome to Expert Snapshot Legal"
        onLogoutClick={handleLogout} // 🔹 Add logout button in header
      />

      <main className={styles.landing}>
        <header className={styles.hero}>
          <p>
            Create tailored legal agreements from any template with precision and control
          </p>
        </header>

        <section className={styles.templateOptions}>
          {iconsReady ? (
            <>
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
            </>
          ) : (
            <div className={styles.cardGroup}>
              <h3>Loading templates...</h3>
              <div className={styles.retainerCardGrid}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <ShimmerCard key={i} />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomePage;
