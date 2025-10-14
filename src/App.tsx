/** @jsxImportSource @emotion/react */

import React, { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import Header from '../components/Header';
import LoginPage from '../components/Login/LoginPage';
import GalleryView from '../components/Gallery/GalleryView';
import Navigation from '../components/Navigation';
import WriterView from '../components/Writer/WriterView';
import type { ViewMode } from '../types/ui';
import { useLocalization } from '../contexts/localizationUtils';
import { LocalizationProvider } from '../contexts/LocalizationContext';
import { AuthUserProvider } from '../providers/AuthUserProvider';
import { 
  LeaderboardListProvider,
  LeaderboardImagesProvider,
 } from '../providers/LeaderboardProvider';

interface AppProps {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
}

const AppContent: React.FC<AppProps> = ({ activeView, setActiveView }) => {
  const { t } = useLocalization();
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
                  <GalleryView showStudentNames={showStudentNames} />
                </LeaderboardImagesProvider>
            </LeaderboardListProvider>
              
        )
      case 'word_cloud':
        //return <MistakesList mistakes={writingMistakes} />;
        return <p className="text-slate-500 text-center py-10">{t('placeholders.comingSoon')}</p>;
      case 'analytics':
        //return <AnalyticsDashboard mistakes={writingMistakes} />;
        return <p className="text-slate-500 text-center py-10">{t('placeholders.comingSoon')}</p>;
      case 'writer':
        return (
              <LeaderboardListProvider>
                <LeaderboardImagesProvider>
                  <WriterView />
                </LeaderboardImagesProvider>
              </LeaderboardListProvider>
        )
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
    </div>
  );
};



function MainPage() {
  document.location = "/avery_analytics/writer";
  return <></>;
}

const App: React.FC = () => {
  const RequireAuth = (props: { children: React.ReactElement }) => {
    const token = sessionStorage.getItem("access_token");
    if (token) {
      return props.children;
    }
    document.location = "/avery_analytics/login";
    return <></>;
  }
  const [activeView, setActiveView] = useState<ViewMode>('writer');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/avery_analytics/login" element={<LoginPage />} />
        <Route path="/avery_analytics" element={<MainPage />} />
        {/* Writer Route */}
        <Route path="/avery_analytics/writer" element={
          <AuthUserProvider>
            <RequireAuth>
              <LocalizationProvider>
                <AppContent activeView={activeView} setActiveView={setActiveView} />
              </LocalizationProvider>
            </RequireAuth>
          </AuthUserProvider>
        } />
        {/* Gallery Route */}
        <Route path="/avery_analytics/gallery" element={
          <AuthUserProvider>
            <RequireAuth>
              <LocalizationProvider>
                <AppContent activeView={activeView} setActiveView={setActiveView} />
              </LocalizationProvider>
            </RequireAuth>
          </AuthUserProvider>
        } />
        {/* Word Cloud Route */}
        <Route path="/avery_analytics/word_cloud" element={
          <AuthUserProvider>
            <RequireAuth>
              <LocalizationProvider>
                <AppContent activeView={activeView} setActiveView={setActiveView} />
              </LocalizationProvider>
            </RequireAuth>
          </AuthUserProvider>
        } />
        {/* Analytics Route */}
        <Route path="/avery_analytics/analytics" element={
          <AuthUserProvider>
            <RequireAuth>
              <LocalizationProvider>
                <AppContent activeView={activeView} setActiveView={setActiveView} />
              </LocalizationProvider>
            </RequireAuth>
          </AuthUserProvider>
        } />
      </Routes>
    </BrowserRouter>

  );
};

export default App;
