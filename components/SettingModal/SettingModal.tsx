/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useRef } from 'react';
import { css } from "@emotion/react";
import type { Theme } from "@mui/material/styles";
import Box from '@mui/material/Box';
import { Modal } from '@mui/material';
import {theme} from "../../src/Theme";
import { useLocalization } from '../../contexts/localizationUtils';
import { SETTING_TABS } from '../../types/ui';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

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
  const [compactMode, setCompactMode] = useState(false);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const settingTabsRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const listEl = settingTabsRef.current;
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


  const renderSettingTab = (tabName: string) => {
    switch (tabName) {
      case 'program':
        return (<div>Program Settings Content</div>);
      case 'scene':
        return (<div>Scene Settings Content</div>);
      case 'story':
        return (<div>Story Settings Content</div>);
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
                  <span className="sr-only">{t(tab.label)}</span>
                </>
            } {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      {
        SETTING_TABS.map((tab, index) => (
          <SettingTabPanel value={value} index={index} key={tab.tabName}>
            { renderSettingTab(tab.tabName) }
          </SettingTabPanel>
        ))
      }
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