import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import StudentCard from '../components/StudentCard';
import MistakesList from '../components/MistakesList';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import type { StudentWork, WritingMistake } from '../types/studentWork';
import type { ViewMode } from '../types/ui';
import { fetchStudentWorks, fetchWritingMistakes } from '../services/mockDataService';
import { useLocalization } from '../contexts/localizationUtils';
import { LocalizationProvider } from '../contexts/LocalizationContext';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';
import LightbulbIcon from '../components/icons/LightbulbIcon';
import ChartBarIcon from '../components/icons/ChartBarIcon';

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
          studentWorks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentWorks.map(sw => <StudentCard key={sw.student.id} studentWork={sw} />)}
            </div>
          ) : <p className="text-slate-500 text-center py-10">{t('studentCard.noWritings')}</p>
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
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8 flex items-center">
          {viewTitles[activeView].icon}
          <h2 className="text-3xl font-bold text-slate-700">{t(viewTitles[activeView].titleKey)}</h2>
        </div>
        {renderContent()}
      </main>
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