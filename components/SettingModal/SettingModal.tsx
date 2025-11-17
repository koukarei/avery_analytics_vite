/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useContext } from 'react';
import { css } from "@emotion/react";
import type { Theme } from "@mui/material/styles";
import Box from '@mui/material/Box';
import { Modal } from '@mui/material';
import {theme} from "../../src/Theme";
import { useLocalization } from '../../contexts/localizationUtils';
import { SETTING_TABS } from '../../types/ui';
import { ProgramSelectionTab } from './ProgramSelectionTab';
import { CustomSettingContext } from '../../contexts/CustomSettingContext';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { ProgramProvider } from '../../providers/ProgramProvider';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function SettingTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`setting-tabpanel-${index}`}
      aria-labelledby={`setting-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `setting-tab-${index}`,
    'aria-controls': `setting-tabpanel-${index}`,
  };
}

interface SettingTabsProps {
  value: number;
  setValue: (value: number) => void;
}

const SettingTabs: React.FC<SettingTabsProps> = ({ value, setValue }) => {
  const { t } = useLocalization();
  const { compactMode } = useContext(CustomSettingContext);
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const renderSettingTab = (tabName: string) => {
    switch (tabName) {
      case 'program':
        return (
          <ProgramProvider>
            <ProgramSelectionTab />
          </ProgramProvider>
      );
      case 'scene':
        return (<div>Under development</div>);
      case 'story':
        return (<div>Under development</div>);
      default:
        return null;
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="setting tabs"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.text.primary, // desired color
              height: 3, // optional: indicator thickness
            },
          }}
        >
          {SETTING_TABS.map((tab, index) => (
            <Tab css={tabStyle(theme)} key={tab.tabName} label={
              compactMode ?
                tab.icon && <tab.icon /> :
                <>
                  {tab.icon && <tab.icon />}
                  <span>{t(tab.label)}</span>
                </>
            } {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ overflowY: 'auto', height: 'calc(90vh - 100px)' }}>
      {
        SETTING_TABS.map((tab, index) => (
          <SettingTabPanel value={value} index={index} key={tab.tabName}>
            { renderSettingTab(tab.tabName) }
          </SettingTabPanel>
        ))
      }
      </Box>
    </Box>
  );
}

interface SettingModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  tabName: 'program' | 'scene' | 'story';
}

export const SettingModal: React.FC<SettingModalProps> = ({
  open,
  setOpen,
  tabName,
}) => {
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    const tabIndex = SETTING_TABS.findIndex(tab => tab.tabName === tabName);
    if (tabIndex !== -1) {
      setTabValue(tabIndex);
    }
  }, [tabName, open]);

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Box css={settingModalStyles(theme)}>
        <SettingTabs value={tabValue} setValue={setTabValue} />
      </Box>
    </Modal>
  )
}
  

const settingModalStyles = (theme: Theme) => css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 90%;
  min-width: 300px;
  width: 80%;
  border-radius: 8px;
  background-color: ${theme.palette.background.paper};
`;

const tabStyle = (theme: Theme) => css`
  color: ${theme.palette.text.secondary};
  &.Mui-selected {
    color: ${theme.palette.text.primary};
  }
`;