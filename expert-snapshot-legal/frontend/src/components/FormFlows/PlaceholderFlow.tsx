import { useEffect } from 'react';
import PlaceholderForm from './PlaceholderForm';
import { FormType } from '@/types/FormType';
import { clearFormState } from '@/utils/clearFormState';

interface Props {
  formType: FormType;
}

export default function PlaceholderFlow({ formType }: Props) {
  useEffect(() => {
    clearFormState();
  }, []);

  return <PlaceholderForm formType={formType} />;
}

