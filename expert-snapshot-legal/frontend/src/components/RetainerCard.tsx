// src/components/RetainerCard.tsx

import React from 'react';
import styles from '../styles/HomePage.module.css';
import { FormType } from '@/types/FormType';

type IconName = 'standard-retainer' | 'ip-counsel' | 'custom-template';

interface RetainerCardProps {
  title: string;
  templateId: FormType;
  iconSrc: IconName;
  onStart: (templateId: FormType) => void;
}

const RetainerCard: React.FC<RetainerCardProps> = ({ title, templateId, iconSrc, onStart }) => {
  const getAltText = (iconName: IconName): string => {
    switch (iconName) {
      case 'standard-retainer':
        return 'Standard Retainer Icon';
      case 'ip-counsel':
        return 'IP Counsel Retainer Icon';
      case 'custom-template':
        return 'Custom Template Icon';
    }
  };

  return (
    <button className={styles.retainerCard} onClick={() => onStart(templateId)}>
      <img
        src={`/icons/${iconSrc}.svg`}
        alt={getAltText(iconSrc)}
        className={styles.cardIcon}
      />
      <h3>{title}</h3>
    </button>
  );
};

export default RetainerCard;

