import React from 'react';
import type { ViewMode } from '../types/ui';
import { useLocalization } from '../contexts/localizationUtils';
import AcademicCapIcon from './icons/AcademicCapIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import EyeIcon from './icons/EyeIcon';
import EyeSlashIcon from './icons/EyeSlashIcon';

interface NavigationProps {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView, showStudentNames, toggleShowStudentNames }) => {
  const { t } = useLocalization();

  const navItems = [
    { id: 'gallery', labelKey: 'navigation.gallery', icon: <AcademicCapIcon className="w-5 h-5 mr-2" /> },
    //{ id: 'mistakes', labelKey: 'navigation.mistakes', icon: <LightbulbIcon className="w-5 h-5 mr-2" /> },
    //{ id: 'analytics', labelKey: 'navigation.analytics', icon: <ChartBarIcon className="w-5 h-5 mr-2" /> },
  ] as const;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <ul className="flex space-x-4">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id)}
                className={`flex items-center py-3 px-3 font-medium border-b-4 transition-colors duration-150
                  ${activeView === item.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-600 hover:text-primary hover:border-primary-light'
                  }`}
                aria-current={activeView === item.id ? "page" : undefined}
              >
                {item.icon}
                {t(item.labelKey)}
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={toggleShowStudentNames}
          className="flex items-center py-2 px-3 text-sm font-medium text-slate-600 hover:text-primary transition-colors duration-150 rounded-md hover:bg-slate-100"
          aria-pressed={!showStudentNames}
          title={showStudentNames ? t('navigation.toggleStudentNames.hide') : t('navigation.toggleStudentNames.show')}
        >
          {showStudentNames ? <EyeSlashIcon className="w-5 h-5 mr-1.5" /> : <EyeIcon className="w-5 h-5 mr-1.5" />}
          {showStudentNames ? t('navigation.toggleStudentNames.hide') : t('navigation.toggleStudentNames.show')}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
