/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { useLocalization } from '../contexts/localizationUtils';
import { theme } from '../src/Theme';

const Footer: React.FC = () => {
  const { t } = useLocalization();
  return (
    <footer className="text-center p-4 mt-auto" css={footerStyle}>
      <p>{t('footer.text', { year: new Date().getFullYear() })}</p>
    </footer>
  );
};

export default Footer;

const footerStyle = css`
  background-color: ${theme.palette.primary.main};
  color: ${theme.palette.text.secondary};
  width: 100%;
  box-sizing: border-box;
  flex: 0 0 auto; 
`;