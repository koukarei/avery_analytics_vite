/** @jsxImportSource @emotion/react */

import React from 'react';

import Header from '../Header';
import Footer from '../Footer';
import Navigation from '../Navigation';
import { AuthUserProvider } from '../../providers/AuthUserProvider';
import { CustomSettingProvider } from '../../providers/CustomSettingProvider';
import { css } from '@emotion/react';
import { UserActionAPI } from '../../api/UserAction';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handleUserAction = async (action_name: string) => {
    await UserActionAPI.createUserAction(
      {
        action: action_name,
        related_id: 0,
        sent_at: new Date(),
      }
    )
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      handleUserAction("tab_hidden");
    } else {
      handleUserAction("tab_visible");
    }
  });

  window.addEventListener("focus", () => {
    handleUserAction("window_focused");
  });

  window.addEventListener("blur", () => {
    handleUserAction("window_blurred");
  });

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

