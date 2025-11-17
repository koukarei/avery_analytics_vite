/** @jsxImportSource @emotion/react */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { css } from '@emotion/react';
import {theme} from "../src/Theme";
import type { Theme } from "@mui/material/styles";
import type { ViewMode } from '../types/ui';
import { useLocalization } from '../contexts/localizationUtils';
import AcademicCapIcon from './icons/AcademicCapIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import EyeIcon from './icons/EyeIcon';
import EyeSlashIcon from './icons/EyeSlashIcon';
import { AuthUserContext } from '../providers/AuthUserProvider';
import { CustomSettingContext } from '../contexts/CustomSettingContext';
import { Link, useLocation } from "react-router-dom";
import { Button } from '@mui/material';


const ShowToggleStudentName: React.FC<{iconOnly: boolean}> = ({iconOnly}) => {
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
        <Button
          onClick={toggleShowStudentNames}
          className="flex items-center py-2 px-3 text-sm font-medium transition-colors duration-150 rounded-md"
          css={showToggleStudentNameButtonStyle(theme)}
          aria-pressed={!showStudentNames}
          title={showStudentNames ? t('navigation.toggleStudentNames.hide') : t('navigation.toggleStudentNames.show')}
        >
          {showStudentNames ? <EyeSlashIcon className="w-5 h-5 mr-1.5" /> : <EyeIcon className="w-5 h-5 mr-1.5" />}
          {iconOnly ? null : showStudentNames ? t('navigation.toggleStudentNames.hide') : t('navigation.toggleStudentNames.show')}
        </Button>
    </div>
  );
}


const Navigation: React.FC = () => {
  const { t } = useLocalization();
  const [activeView, setActiveView] = useState<ViewMode>('writer');

  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    setActiveView(path.includes('/gallery') ? 'gallery' 
                    : path.includes('/word_cloud') ? 'word_cloud' 
                    : path.includes('/analytics') ? 'analytics' 
                    : 'writer');
  }, [path]);

  // new: compactMode toggles when there isn't enough horizontal space for nav labels
  const navListRef = useRef<HTMLUListElement | null>(null);
  const { compactMode, setCompactMode } = useContext(CustomSettingContext);

  useEffect(() => {
    const listEl = navListRef.current;
    if (!listEl) return;

    const parent = listEl.parentElement as HTMLElement | null;

    // measure the full width required when labels are visible by cloning the UL
    const measureRequiredWithLabels = () => {
      // clone the list so we can force labels visible without affecting real layout
      const clone = listEl.cloneNode(true) as HTMLElement;
      // place offscreen so it doesn't affect layout
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '-9999px';
      clone.style.width = 'auto';
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      // override common 'sr-only' / hidden styles so labels inside clone contribute to width
      const style = document.createElement('style');
      style.textContent = `
        .sr-only, .sr-only * { position: static !important; width: auto !important; height: auto !important; clip: auto !important; overflow: visible !important; white-space: nowrap !important; }
        .hidden, .hidden * { display: inline !important; }
      `;
      clone.appendChild(style);
      document.body.appendChild(clone);

      // compute required width summing children (matches how layout will behave)
      const items = Array.from(clone.children) as HTMLElement[];
      const required = items.reduce((sum, li) => sum + li.getBoundingClientRect().width, 0);

      document.body.removeChild(clone);
      return required;
    };

    const checkOverflow = () => {
      const required = measureRequiredWithLabels();

      // available width: parent container minus any controls (toggle button)
      const containerWidth = parent ? parent.clientWidth : listEl.clientWidth;

      const tolerance = 5;
      const available = containerWidth - tolerance;

      const newCompact = required > available;
      // avoid unnecessary state updates (prevents flip-flop)
      setCompactMode((prev) => (prev === newCompact ? prev : newCompact));
    };

    // initial checks (next paint + a short timeout for font/layout)
    requestAnimationFrame(checkOverflow);
    const timeoutId = window.setTimeout(checkOverflow, 80);

    // observe resizes of the list element and its container
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(checkOverflow);
      ro.observe(listEl);
      if (parent) ro.observe(parent);
    }

    window.addEventListener('resize', checkOverflow);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', checkOverflow);
      window.clearTimeout(timeoutId);
    };
  }, [t]); // re-run when localization function changes (labels may change length)


  const navItems = [
    { id: 'writer', labelKey: 'navigation.writer', icon: <BookOpenIcon className="w-5 h-5 mr-2" /> },
    { id: 'gallery', labelKey: 'navigation.gallery', icon: <AcademicCapIcon className="w-5 h-5 mr-2" /> },
    { id: 'word_cloud', labelKey: 'navigation.word_cloud', icon: <LightbulbIcon className="w-5 h-5 mr-2" /> },
    { id: 'analytics', labelKey: 'navigation.analytics', icon: <ChartBarIcon className="w-5 h-5 mr-2" /> },
  ] as const;

  return (
    <nav className="shadow-sm sticky top-0 z-10" css={headerStyles}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <ul id="navigation-bar-list" ref={navListRef} className="flex space-x-4">
          {navItems.map((item) => (
            <li key={item.id}>
              <Link
                reloadDocument
                to={`/${item.id}`}
                onClick={() => setActiveView(item.id)}
                title={t(item.labelKey)} // show full label on hover in compact mode
                className={`flex items-center py-3 px-3 font-medium border-b-4 transition-colors duration-150
                  ${activeView === item.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-600 hover:text-primary hover:border-primary-light'
                  }`}
                aria-current={activeView === item.id ? "page" : undefined}
              >
                {/* show icon only when there isn't enough space (compactMode) */}
                {compactMode ? (
                  <>
                    {item.icon}
                    <span className="sr-only">{t(item.labelKey)}</span>
                  </>
                ) : (
                  <>
                    {item.icon}
                    {t(item.labelKey)}
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
          <ShowToggleStudentName iconOnly={compactMode} />
      </div>
    </nav>
  );
};

export default Navigation;

const headerStyles = css`
  background-color: ${theme.palette.background.paper};
  color: ${theme.palette.text.primary};
`;

const showToggleStudentNameButtonStyle = (theme: Theme) => css`
  color: ${theme.palette.text.primary};
  &:hover {
    background-color: ${theme.palette.action.hover};
    color: ${theme.palette.text.secondary};
  }
`;