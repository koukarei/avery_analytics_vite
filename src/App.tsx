import React, { useState, useCallback, useEffect } from 'react';
import Header from '../components/Header';
import { ImageGallery } from '../components/ImageGallery';
import { GrammarVisualization } from '../components/GrammarVisualization';
import { DescriptiveWriting } from '../components/DescriptiveWriting';
import Navigation from '../components/Navigation';
import StudentCard from '../components/StudentCard';
import MistakesList from '../components/MistakesList';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import type { StudentWork, WritingMistake } from '../types/studentWork';
import type { ViewMode } from '../types/ui';
import { BottomContentType } from '../types/gallery';
import { fetchStudentWorks, fetchWritingMistakes } from '../services/mockDataService';
import { useLocalization } from '../contexts/localizationUtils';
import { LocalizationProvider } from '../contexts/LocalizationContext';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';
import LightbulbIcon from '../components/icons/LightbulbIcon';
import ChartBarIcon from '../components/icons/ChartBarIcon';
import { IMAGE_DATA, GRAMMAR_MISTAKES_DATA, DESCRIPTIVE_WRITING_SAMPLE } from '../constants';

const LoadingSpinner: React.FC = () => {
  const { t } = useLocalization();
  return (
    <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
      <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-slate-600">{t('loading.text')}</p>
    </div>
  );
};

const ErrorDisplay: React.FC<{ messageKey: string }> = ({ messageKey }) => {
  const { t } = useLocalization();
  return (
    <div className="text-center p-10 bg-red-50 border border-red-200 rounded-md" role="alert">
      <p className="text-red-600 font-semibold">{t('error.title')}</p>
      <p className="text-red-500">{t(messageKey)}</p>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { t } = useLocalization();
  const [activeView, setActiveView] = useState<ViewMode>('gallery');
  const [studentWorks, setStudentWorks] = useState<StudentWork[]>([]);
  const [writingMistakes, setWritingMistakes] = useState<WritingMistake[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [galleryCurrentIndex, setGalleryCurrentIndex] = useState<number>(0);
  const [bottomContent, setBottomContent] = useState<BottomContentType>(BottomContentType.GRAMMAR_VISUALIZATION);

  const handleGalleryScroll = useCallback((direction: 'up' | 'down') => {
    setGalleryCurrentIndex(prevIndex => {
      let newIndex = prevIndex;
      if (direction === 'down') { // Scroll down -> move images left (next)
        newIndex = prevIndex + 1;
      } else { // Scroll up -> move images right (previous)
        newIndex = prevIndex - 1;
      }
      return newIndex > 0 ? newIndex % IMAGE_DATA.length : IMAGE_DATA.length + newIndex; // Wrap around
    });
  }, []);

  const handleSwitchToDescriptiveWriting = useCallback(() => {
    setBottomContent(BottomContentType.DESCRIPTIVE_WRITING);
  }, []);
  
  const handleReturnToGrammarView = useCallback(() => {
    setBottomContent(BottomContentType.GRAMMAR_VISUALIZATION);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setErrorKey(null);
      try {
        const [works, mistakes] = await Promise.all([
          fetchStudentWorks(),
          fetchWritingMistakes(),
        ]);
        setStudentWorks(works);
        setWritingMistakes(mistakes);
      } catch (err) {
        console.error("Failed to load data:", err);
        setErrorKey("error.fetchMessage");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (errorKey) {
      return <ErrorDisplay messageKey={errorKey} />;
    }

    switch (activeView) {
      case 'gallery':
        return (
          <div className="flex flex-col h-screen bg-black overflow-hidden">
            {/* Top Half: Image Gallery */}
            <div className="h-1/2 md:h-3/5 relative flex flex-col items-center justify-center bg-neutral-900 overflow-hidden pt-4 md:pt-8">
              {IMAGE_DATA.length > 0 ? (
                <ImageGallery
                  images={IMAGE_DATA}
                  currentIndex={galleryCurrentIndex}
                  onScroll={handleGalleryScroll}
                />
              ) : (
                <p className="text-xl text-gray-400">No images to display.</p>
              )}
            </div>

            {/* Bottom Half: Toggleable Content */}
            <div className="h-1/2 md:h-2/5 bg-neutral-900 flex items-center justify-center p-4 md:p-8 relative">
              {bottomContent === BottomContentType.GRAMMAR_VISUALIZATION ? (
                <GrammarVisualization
                  mistakes={GRAMMAR_MISTAKES_DATA}
                  onInteractionEnd={handleSwitchToDescriptiveWriting}
                />
              ) : (
                <DescriptiveWriting 
                  text={DESCRIPTIVE_WRITING_SAMPLE} 
                  onReturnToGrammarView={handleReturnToGrammarView}
                />
              )}
            </div>
          </div>
        );
      case 'mistakes':
        return <MistakesList mistakes={writingMistakes} />;
      case 'analytics':
        return <AnalyticsDashboard mistakes={writingMistakes} />;
      default:
        return <p className="text-slate-500 text-center py-10">{t('placeholders.selectView')}</p>;
    }
  };
  
  const viewTitles: Record<ViewMode, { titleKey: string; icon: React.ReactNode }> = {
    gallery: { titleKey: "viewTitles.gallery", icon: <AcademicCapIcon className="w-7 h-7 mr-2 text-primary"/> },
    mistakes: { titleKey: "viewTitles.mistakes", icon: <LightbulbIcon className="w-7 h-7 mr-2 text-secondary"/> },
    analytics: { titleKey: "viewTitles.analytics", icon: <ChartBarIcon className="w-7 h-7 mr-2 text-accent"/> },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navigation activeView={activeView} setActiveView={setActiveView} />
      {renderContent()}
      <footer className="bg-slate-800 text-slate-300 text-center p-4 mt-auto">
        <p>{t('footer.text', { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LocalizationProvider>
      <AppContent />
    </LocalizationProvider>
  );
};

export default App;