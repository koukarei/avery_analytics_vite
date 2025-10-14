/** @jsxImportSource @emotion/react */
import React, { useContext, useEffect } from 'react';
import { css } from '@emotion/react';
import {theme} from "../src/Theme";
import type { ViewMode } from '../types/ui';
import { useLocalization } from '../contexts/localizationUtils';
import AcademicCapIcon from './icons/AcademicCapIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import EyeIcon from './icons/EyeIcon';
import EyeSlashIcon from './icons/EyeSlashIcon';
import { AuthUserContext } from '../providers/AuthUserProvider';
import { CustomSettingContext } from '../providers/CustomSettingProvider';
import { Link, useLocation } from "react-router-dom";


const ShowToggleStudentName: React.FC = () => {
  const { currentUser, loading } = useContext(AuthUserContext);
  const { showStudentNames, setShowStudentNames } = useContext(CustomSettingContext);
  const { t } = useLocalization();

  const toggleShowStudentNames = () => {
    setShowStudentNames(!showStudentNames);
  };

  if (loading || currentUser?.user_type !== 'instructor') {
    return null;
  }
  return (
    <div>
        <button
          onClick={toggleShowStudentNames}
          className="flex items-center py-2 px-3 text-sm font-medium transition-colors duration-150 rounded-md"
          aria-pressed={!showStudentNames}
          title={showStudentNames ? t('navigation.toggleStudentNames.hide') : t('navigation.toggleStudentNames.show')}
        >
          {showStudentNames ? <EyeSlashIcon className="w-5 h-5 mr-1.5" /> : <EyeIcon className="w-5 h-5 mr-1.5" />}
          {showStudentNames ? t('navigation.toggleStudentNames.hide') : t('navigation.toggleStudentNames.show')}
        </button>
    </div>
  );
}


const Navigation: React.FC = () => {
  const { t } = useLocalization();
  const [activeView, setActiveView] = React.useState<ViewMode>('writer');

  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    setActiveView(path.includes('/gallery') ? 'gallery' 
                    : path.includes('/word_cloud') ? 'word_cloud' 
                    : path.includes('/analytics') ? 'analytics' 
                    : 'writer');
  }, [path]);


  const navItems = [
    { id: 'writer', labelKey: 'navigation.writer', icon: <BookOpenIcon className="w-5 h-5 mr-2" /> },
    { id: 'gallery', labelKey: 'navigation.gallery', icon: <AcademicCapIcon className="w-5 h-5 mr-2" /> },
    { id: 'word_cloud', labelKey: 'navigation.word_cloud', icon: <LightbulbIcon className="w-5 h-5 mr-2" /> },
    { id: 'analytics', labelKey: 'navigation.analytics', icon: <ChartBarIcon className="w-5 h-5 mr-2" /> },
  ] as const;

  return (
    <nav className="shadow-sm sticky top-0 z-10" css={headerStyles}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <ul id="navigation-bar-list" className="flex space-x-4">
          {navItems.map((item) => (
            <li key={item.id}>
              <Link
                to={`/${item.id}`}
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
              </Link>
            </li>
          ))}
        </ul>
          <ShowToggleStudentName />
      </div>
    </nav>
  );
};

export default Navigation;

const headerStyles = css`
  background-color: ${theme.palette.background.paper};
  color: ${theme.palette.text.primary};
`;
