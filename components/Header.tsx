/** @jsxImportSource @emotion/react */

import React, {useContext, useState} from 'react';
import { useLocalization } from '../contexts/localizationUtils';
import IconComponent from './icons/AVERYIcon';
import LoginIcon from './icons/LoginIcon';
import LogoutIcon from './icons/LogoutIcon';
import { AuthUserContext } from '../providers/AuthUserProvider';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { SUPPORTED_LANGUAGES } from '../constants';
import type { Language } from '../types/ui';
import { Button } from '@mui/material';
import { css } from "@emotion/react";
import {theme} from "../src/Theme";

const ShowUserProfile: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { currentUser, loading } = useContext(AuthUserContext);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('token_type');
    sessionStorage.removeItem('program');
    
    if (sessionStorage.getItem("school")) {
      switch (sessionStorage.getItem("school")) {
        case "lms":
          window.location.href = "https://lms.let.media.kyoto-u.ac.jp/moodle/course/view.php"
          break;
        case "saikyo":
          window.location.href = "https://sk.let.media.kyoto-u.ac.jp"
          break;
        case "hikone":
          window.location.href = "https://leaf02.uchida.co.jp/moodle/"
          break;
        case "tom":
          window.location.href = "https://dev.leaf.ederc.jp/moodle/course/view.php?id=7"
          break;
        case "tomsec":
          window.location.href = "https://dev.leaf.ederc.jp/moodle/course/view.php?id=8"
          break;
        case "newleaf":
          window.location.href = "https://newleaf.let.media.kyoto-u.ac.jp/moodle/course/view.php?id=2"
          break;
        default:
          window.location.href = '/login';
          break;
      }
      sessionStorage.removeItem("school");
    } else {
        window.location.href = '/login';
      }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'show-user-profile-popover' : undefined;

  return (
    <div>
      <IconButton css={iconStyle} aria-describedby={id} aria-label="user profile" onClick={handleClick}>
        <LoginIcon className='w-10 h-10' />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Card sx={{ minWidth: 300, maxWidth: 400 }}>
          <CardContent>
            <Typography  gutterBottom variant="h5" component="div"> {loading? "loading" : (currentUser?.profiles.display_name)} </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}> {currentUser?.email} </Typography>
          </CardContent>
          <CardActions>
            <Button sx={{ color: theme.palette.primary.dark }} onClick={handleLogout}>
              <LogoutIcon className='w-6 h-6' />
              Logout
            </Button>
          </CardActions>
        </Card>
      </Popover>
    </div>
  );
}


const Header: React.FC = () => {
  const { t, language, setLanguage } = useLocalization();

  return (
    <header className="shadow-md" css={headerStyles}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button aria-label="Home" onClick={() => window.location.href = '/' } className="flex items-center mr-4">
            <IconComponent className="w-16 h-16 items-center text-white mr-2"/>
            <h1 className="text-3xl font-bold text-white">{t('header.title')}</h1>
          </button>
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
          <ShowUserProfile />
        </div>
      </div>
    </header>
  );
};

export default Header;

const headerStyles = css`
  background-color: ${theme.palette.primary.main};
  color: ${theme.palette.text.primary};
`;

const iconStyle = css`
  color: ${theme.palette.primary.contrastText};
`;
