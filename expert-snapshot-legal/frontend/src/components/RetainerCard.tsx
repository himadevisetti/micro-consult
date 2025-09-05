import React from 'react';
import styles from '../styles/HomePage.module.css';
import { FormType } from '@/types/FormType';
import type { IconName } from '@/types/IconName';

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
        return 'Standard Retainer icon';
      case 'ip-rights-licensing':
        return 'IP Rights & Licensing icon';
      case 'startup-advisory':
        return 'Startup Advisory icon';
      case 'employment-agreement':
        return 'Employment Agreement icon';
      case 'litigation-engagement':
        return 'Litigation Engagement icon';
      case 'real-estate-contract':
        return 'Real Estate Contract icon';
      case 'family-law-agreement':
        return 'Family Law Agreement icon';
      case 'custom-template':
        return 'Custom Template icon';
      default:
        return 'Legal agreement icon'; // fallback
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
