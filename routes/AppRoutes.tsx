import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GalleryView from '../components/Gallery/GalleryView';
import WriterView from '../components/Writer/WriterView';
import { useLocalization } from '../contexts/localizationUtils';
import { 
  LeaderboardListProvider,
  LeaderboardImagesProvider,
 } from '../providers/LeaderboardProvider';

const AppRoutes: React.FC = () => {
  const { t } = useLocalization();

  return (
    <Routes>
      {/* default -> writer */}
      <Route index element={<Navigate to="writer" replace />} />

      <Route path="gallery" element={
        <LeaderboardListProvider>
          <LeaderboardImagesProvider>
            <GalleryView />
          </LeaderboardImagesProvider>
        </LeaderboardListProvider>
      } />

      <Route path="word_cloud" element={
        <p className="text-slate-500 text-center py-10">{t('placeholders.comingSoon')}</p>
      } />

      <Route path="analytics" element={
        <p className="text-slate-500 text-center py-10">{t('placeholders.comingSoon')}</p>
      } />

      <Route path="writer" element={
        <LeaderboardListProvider>
          <LeaderboardImagesProvider>
            <WriterView />
          </LeaderboardImagesProvider>
        </LeaderboardListProvider>
      } />
    </Routes>
  );
};

export default AppRoutes;