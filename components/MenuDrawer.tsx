/** @jsxImportSource @emotion/react */

import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { Divider, MenuItem, Typography } from '@mui/material';
import List from '@mui/material/List';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { TextField } from "@mui/material";
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PollIcon from '@mui/icons-material/Poll';
import { css } from "@emotion/react";
import {theme} from "../src/Theme";
import { useLocalization } from '../contexts/localizationUtils';
import { SUPPORTED_LANGUAGES, SUPPORTED_PROGRAMS } from '../constants';
import type { Language, settingTabName, SettingTab } from '../types/ui';
import { SETTING_TABS } from '../types/ui';
import { ProgramContext } from '../providers/ProgramProvider';
import { AuthUserContext } from '../providers/AuthUserProvider';
import { CustomSettingContext } from '../contexts/CustomSettingContext';
import { LoadingSpinner } from './Common/LoadingSpinner';

type Anchor = 'top' | 'left' | 'bottom' | 'right';

interface MenuDrawerProps {
  setSettingModalOpen: (open: boolean) => void;
  setTabName: (tabName: settingTabName) => void;
}

export default function MenuDrawer({
  setSettingModalOpen,
  setTabName,
}: MenuDrawerProps) {
  const { t, language, setLanguage } = useLocalization();
  const [ state, setState ] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });
  const { curProgram, setCurProgram } = React.useContext(CustomSettingContext);
  const { fetchUserPrograms, setCheckingUserId, userPrograms, isUserLoading } = React.useContext(ProgramContext);
  const { currentUser } = React.useContext(AuthUserContext);
  const [ qLink, setQLink ] = React.useState<string>('');
  const toggleDrawer =
    (anchor: Anchor, open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setState({ ...state, [anchor]: open });
    };

  const defaultLangCode: string = language || 'ja';

  const handleModalOpen = (tabName: settingTabName) => {
    setSettingModalOpen(true);
    setTabName(tabName);
  };

  React.useEffect(() => {
    if (currentUser) {
      setCheckingUserId(currentUser.id);
      fetchUserPrograms().then((userPrograms) => {
        if (curProgram === null && userPrograms.length > 0) {
          setCurProgram(userPrograms[0]);
        }
      })
    }
  }, [currentUser]);

  React.useEffect(() => {
    if (curProgram && currentUser) {
      const feedback = curProgram.feedback;
      const username = currentUser.username;
      if (feedback && feedback.includes("IMG")) {
        setQLink(`https://docs.google.com/forms/d/e/1FAIpQLSfgdj3GEPB8edXh-z--9PSaffnDwicq9a8obYJ-PTiToPqZRA/viewform?usp=pp_url&entry.1976829923=${username}`)
      }
      if (feedback && feedback.includes("AWE")) {
        setQLink(`https://docs.google.com/forms/d/e/1FAIpQLSd4udz6WYU0TsMur2f_DOdIvJt51vNfdeQ9gzF5XgAl2TGObA/viewform?usp=pp_url&entry.1976829923=${username}`)
      }
    }
  }, [curProgram]);

  const list = (anchor: Anchor) => (
    <Box
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
      role="presentation"
      onClick={toggleDrawer('right', false)}
      onKeyDown={toggleDrawer('right', false)}
    >
        <Typography sx={{ p: 2, color: 'text.secondary' }}>{t("header.menuDrawer.languageSettings")}</Typography>
        <TextField 
            hiddenLabel
            variant="filled"
            size="small"
            css={menuSettingStyle}
            select 
            defaultValue={defaultLangCode}
            onChange={(e) => {
                const selectedLang = e.target.value as keyof typeof SUPPORTED_LANGUAGES;
                setLanguage(selectedLang as Language);
            }}
        >
            {Object.keys(SUPPORTED_LANGUAGES).map((langCode) => (
                <MenuItem key={langCode} value={langCode}>
                    {SUPPORTED_LANGUAGES[langCode as Language].name}
                </MenuItem>
            ))}
        </TextField>
        <Typography sx={{ p: 2, color: 'text.secondary' }}>{t("header.menuDrawer.programSettings")}</Typography>
        <TextField 
            hiddenLabel
            variant="filled"
            size="small"
            css={menuSettingStyle}
            select 
            defaultValue={curProgram ? curProgram.name : ''}
            onChange={(e) => {
                const selectedProgram = e.target.value as keyof typeof SUPPORTED_PROGRAMS;
                setCurProgram(userPrograms.find(prog => prog.name === selectedProgram) || null);
            }}
        >
            {userPrograms.map((program) => (
                <MenuItem key={program.id} value={program.name}>
                    {
                      program.name && (program.name in SUPPORTED_PROGRAMS)
                        ? SUPPORTED_PROGRAMS[program.name as keyof typeof SUPPORTED_PROGRAMS].name
                        : program.name
                    }
                </MenuItem>
            ))}
        </TextField>
      <Divider />
      <Typography sx={{ p: 2, color: 'text.secondary' }}>{t("header.menuDrawer.survey")}</Typography>
      {qLink && (
        <List>
          <ListItem key={"questionnaire"} disablePadding>
            <ListItemButton onClick={
              ()=>{window.open(
                qLink, "mozillaWindow", "popup"
              )}
            }
            >
              <ListItemIcon>
                <PollIcon />
              </ListItemIcon>
              <ListItemText primary={t("header.menuDrawer.surveyLink")} />
            </ListItemButton>
          </ListItem>
        </List>
      )}
      <Divider />
      <Typography sx={{ p: 2, color: 'text.secondary' }}>{t("header.menuDrawer.appManagement")}</Typography>
      <List>
        {SETTING_TABS.map((item: SettingTab) => {
          const Icon = item.icon;
          return (
            <ListItem key={item.tabName} disablePadding>
              <ListItemButton onClick={
                () => handleModalOpen(item.tabName)
              }>
                <ListItemIcon>
                  {Icon ? <Icon /> : null}
                </ListItemIcon>
                <ListItemText primary={t(item.label)} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  if (isUserLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
        <React.Fragment key={'right'}>
            <IconButton css={iconStyle} onClick={toggleDrawer('right', true)}><MenuIcon /></IconButton>
            <Drawer
                anchor={'right'}
                open={state['right']}
                onClose={toggleDrawer('right', false)}
            >
              {list('right')}
            </Drawer>
        </React.Fragment>
    </div>
  );
}



const iconStyle = css`
  color: ${theme.palette.primary.contrastText};
  justify-content: center;
  align-items: center;
`;

const menuSettingStyle = css`
    border-radius: 8px;
    margin: 10px;
    width: calc(100% - 32px);
`;