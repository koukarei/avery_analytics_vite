/** @jsxImportSource @emotion/react */

import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import LoginPage from '../components/Login/LoginPage';
import MainLayout from '../components/Common/MainLayout';
import AppRoutes from '../routes/AppRoutes';

import { LocalizationProvider } from '../contexts/LocalizationContext';
import { AuthUserProvider } from '../providers/AuthUserProvider';
import { CustomSettingProvider } from '../contexts/CustomSettingContext';

function getCookie(name: string): string | null {
  const encodedName = encodeURIComponent(name) + "=";
  const parts = document.cookie ? document.cookie.split('; ') : [];
  const match = parts.find((p) => p.startsWith(encodedName));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function MainPage() {
  const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const token = sessionStorage.getItem("access_token");
    if (token) {
      return children;
    }
    if (getCookie("authData")) {
      for (const [key, value] of Object.entries(JSON.parse(getCookie("authData") || "{}"))) {
        sessionStorage.setItem(key, String(value));
      }
      if (sessionStorage.getItem("access_token")) {
        return children;
      }
    }
    return <Navigate to="/login" replace />;
  }

  return (
    <AuthUserProvider>
      <RequireAuth>
        <LocalizationProvider>
          <CustomSettingProvider>
            <MainLayout>
              <AppRoutes />
            </MainLayout>
          </CustomSettingProvider>
        </LocalizationProvider>
      </RequireAuth>
    </AuthUserProvider>
  );
}

const App: React.FC = () => {
  // Vite exposes the build base at import.meta.env.BASE_URL (e.g. '/avery_analytics/')
  const base = (import.meta as any).env?.BASE_URL || '/';
  return (
    <BrowserRouter basename={base}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
