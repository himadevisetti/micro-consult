import { useEffect } from 'react';
import PlaceholderForm from './PlaceholderForm';
import { FormType } from '@/types/FormType';

interface Props {
  formType: FormType;
}

export default function PlaceholderFlow({ formType }: Props) {
  useEffect(() => {
    sessionStorage.clear();
  }, []);

  return <PlaceholderForm formType={formType} />;
}

