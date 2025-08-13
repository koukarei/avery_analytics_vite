import React from 'react';
import { useLocalization } from '../contexts/localizationUtils';
import IconComponent from './icons/AVERYIcon';
import LoginIcon from './icons/LoginIcon';
import LogoutIcon from './icons/LogoutIcon';
import { UserAPI } from '../api/User';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { SUPPORTED_LANGUAGES } from '../constants';
import type { Language } from '../types/ui';

function showUserProfile() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'show-user-profile-popover' : undefined;

  return (
    <div>
      <IconButton color="primary" aria-describedby={id} aria-label="user profile" onClick={handleClick}>
        <LoginIcon className='w-10 h-10' />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Typography sx={{ p: 2 }}>UserAPI.fetchAuthUser()</Typography>
      </Popover>
    </div>
  );
}


const Header: React.FC = () => {
  const { t, language, setLanguage } = useLocalization();

  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <IconComponent className="w-16 h-16 items-center text-white mr-2"/>
          <h1 className="text-3xl font-bold text-white">{t('header.title')}</h1>
        </div>
        <div className="flex space-x-2">
          {Object.keys(SUPPORTED_LANGUAGES).map((langCode) => (
            <button
              key={langCode}
              onClick={() => setLanguage(langCode as Language)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                ${language === langCode 
                  ? 'bg-white text-primary' 
                  : 'bg-primary-dark text-white hover:bg-primary-light hover:text-primary-dark'
                }`}
              aria-pressed={language === langCode}
            >
              {SUPPORTED_LANGUAGES[langCode as Language].name}
            </button>
          ))}
          {showUserProfile()}
        </div>
      </div>
    </header>
  );
};

export default Header;
