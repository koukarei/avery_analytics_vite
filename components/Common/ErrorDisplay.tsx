import React from 'react';
import { useLocalization } from '../../contexts/localizationUtils';

export const ErrorDisplay: React.FC<{ messageKey: string }> = ({ messageKey }) => {
  const { t } = useLocalization();
  return (
    <div className="text-center p-10 bg-red-50 border border-red-200 rounded-md" role="alert">
      <p className="text-red-600 font-semibold">{t('error.title')}</p>
      <p className="text-red-500">{t(messageKey)}</p>
    </div>
  );
};