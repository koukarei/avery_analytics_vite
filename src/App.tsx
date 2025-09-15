/** @jsxImportSource @emotion/react */

import React, { useState, useCallback, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from 'react-router-dom';
import Header from '../components/Header';
import LoginPage from '../components/Login/LoginPage';
import GalleryView from '../components/Gallery/GalleryView';
import Navigation from '../components/Navigation';
import MistakesList from '../components/MistakesList';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import type { ViewMode } from '../types/ui';
import { useLocalization } from '../contexts/localizationUtils';
import { LocalizationProvider } from '../contexts/LocalizationContext';
import { AuthUserProvider } from '../providers/AuthUserProvider';
import { 
  LeaderboardListProvider,
  LeaderboardAnalysisProvider,
  LeaderboardImagesProvider,
  LeaderboardImageProvider,
  WordCloudProvider,
  LeaderboardItemProvider
 } from '../providers/LeaderboardProvider';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';
import LightbulbIcon from '../components/icons/LightbulbIcon';
import ChartBarIcon from '../components/icons/ChartBarIcon';
import { css } from "@emotion/react";
import type { Theme } from "@mui/material/styles";
import {theme} from "../src/Theme";

const AppContent: React.FC = () => {
  const { t } = useLocalization();
  const [activeView, setActiveView] = useState<ViewMode>('gallery');
  const [showStudentNames, setShowStudentNames] = useState<boolean>(false);
  const toggleShowStudentNames = () => {
    setShowStudentNames(prev => !prev);
  };


  const renderContent = () => {
    switch (activeView) {
      case 'gallery':
        return (
            <LeaderboardListProvider>
                <LeaderboardImagesProvider>
                  <GalleryView />
                </LeaderboardImagesProvider>
            </LeaderboardListProvider>
              
        )
      // case 'word_cloud':
      //   return <MistakesList mistakes={writingMistakes} />;
      // case 'analytics':
      //   return <AnalyticsDashboard mistakes={writingMistakes} />;
      // case 'writer':
      //   return (
      //         <LeaderboardListProvider>
      //           <LeaderboardAnalysisProvider>
      //             <LeaderboardImageProvider>
      //               <WordCloudProvider>
      //                 <WriterView />
      //               </WordCloudProvider>
      //             </LeaderboardImageProvider>
      //           </LeaderboardAnalysisProvider>
      //         </LeaderboardListProvider>
      //   )
      default:
        return <p className="text-slate-500 text-center py-10">{t('placeholders.selectView')}</p>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navigation activeView={activeView} setActiveView={setActiveView} 
        showStudentNames={showStudentNames} toggleShowStudentNames={toggleShowStudentNames}/>
      <main className="flex-grow relative overflow-y-auto">
        {renderContent()}
      </main>
      {/* <footer css={footerStyle} className='text-center p-4 mt-auto'>
        <p>{t('footer.text', { year: new Date().getFullYear() })}</p>
      </footer> */}
    </div>
  );
};

const App: React.FC = () => {
  const RequireAuth = (props: { children: React.ReactElement }) => {
    const token = sessionStorage.getItem("access_token");
    if (token) {
      return props.children;
    }
    document.location = "/login";
    return <></>;
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Gallery Route */}
        <Route path="/gallery" element={
          <AuthUserProvider>
            <RequireAuth>
              <LocalizationProvider>
                <LeaderboardListProvider>
                    <LeaderboardImagesProvider>
                      <GalleryView />
                    </LeaderboardImagesProvider>
                </LeaderboardListProvider>
              </LocalizationProvider>
            </RequireAuth>
          </AuthUserProvider>
        } />
        {/* Main Route */}
        <Route path="/" element={
          <AuthUserProvider>
            <RequireAuth>
              <LocalizationProvider>
                <AppContent />
              </LocalizationProvider>
            </RequireAuth>
          </AuthUserProvider>
        } />
      </Routes>
    </BrowserRouter>

  );
};

export default App;

const footerStyle = css`
  background-color: ${theme.palette.primary.main};
  color: ${theme.palette.text.secondary};

  width: 100%;
  text-align: center;
  padding: 30px 0;

  position: absolute;/*←絶対位置*/
  bottom: 0; /*下に固定*/
`;
