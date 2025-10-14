/** @jsxImportSource @emotion/react */

import React from 'react';

import Header from '../Header';
import Footer from '../Footer';
import Navigation from '../Navigation';
import { AuthUserProvider } from '../../providers/AuthUserProvider';
import { CustomSettingProvider } from '../../providers/CustomSettingProvider';
import { css } from '@emotion/react';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  return (
    <div>
        <AuthUserProvider>
          <Header />
          <CustomSettingProvider>
            <Navigation />
            <main css={contentStyle}>{children}</main>
          </CustomSettingProvider>
        </AuthUserProvider>
        <Footer />
    </div>
  );
};

export default MainLayout;


const contentStyle = css`
  flex: 1 0 auto;
  height: 100vh;
  overflow-y: auto;
`;

