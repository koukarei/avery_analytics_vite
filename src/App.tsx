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

function MainPage() {
  const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const token = sessionStorage.getItem("access_token");
    if (token) {
      return children;
    }
    return <Navigate to="/login" replace />;
  }

  return (
    <AuthUserProvider>
      <RequireAuth>
        <LocalizationProvider>
          <MainLayout>
            <AppRoutes />
          </MainLayout>
        </LocalizationProvider>
      </RequireAuth>
    </AuthUserProvider>
  );
}

const App: React.FC = () => {
  return (
    <BrowserRouter basename='/avery_analytics'>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
