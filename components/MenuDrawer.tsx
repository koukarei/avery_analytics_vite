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
import { css } from "@emotion/react";
import {theme} from "../src/Theme";
import { useLocalization } from '../contexts/localizationUtils';
import { SUPPORTED_LANGUAGES } from '../constants';
import type { Language, settingTabName, SettingTab } from '../types/ui';
import { SETTING_TABS } from '../types/ui';

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
            css={langSettingStyle}
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

const langSettingStyle = css`
    border-radius: 8px;
    margin: 10px;
    width: calc(100% - 32px);
`;