// src/components/RetainerCard.tsx

import React from 'react';
import styles from '../styles/HomePage.module.css';
import { FormType } from '@/types/FormType';
import type { IconName } from '@/types/IconName';

interface RetainerCardProps {
  title: string;
  templateId: FormType;
  iconSrc: IconName;
  onStart: (templateId: FormType) => void;
  tooltip?: string; // optional hover text
  disabled?: boolean;
}

// Centralized lookup object for alt text
const altTextMap: Record<IconName, string> = {
  'standard-retainer': 'Standard Retainer icon',
  'ip-rights-licensing': 'IP Rights & Licensing icon',
  'startup-advisory': 'Startup Advisory icon',
  'employment-agreement': 'Employment Agreement icon',
  'litigation-engagement': 'Litigation Engagement icon',
  'real-estate-contract': 'Real Estate Contract icon',
  'family-law-agreement': 'Family Law Agreement icon',
  'custom-template': 'Custom Template icon',
  'upload-template': 'Upload Template icon',
  'generate-document': 'Generate Document icon',
};

const RetainerCard: React.FC<RetainerCardProps> = ({
  title,
  templateId,
  iconSrc,
  onStart,
  tooltip,
  disabled = false,
}) => {
  const classNames = [
    styles.retainerCard,
    disabled ? styles.disabledCard : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classNames}
      onClick={() => !disabled && onStart(templateId)}
      title={tooltip}
      disabled={disabled}
    >
      <img
        src={`/icons/${iconSrc}.svg`}
        alt={altTextMap[iconSrc] || 'Legal agreement icon'}
        className={styles.cardIcon}
      />
      <h3>{title}</h3>
    </button>
  );
};

export default RetainerCard;
