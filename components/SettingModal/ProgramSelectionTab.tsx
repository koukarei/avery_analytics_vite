/** @jsxImportSource @emotion/react */
import React, { useState, useContext, useEffect } from 'react';
import { css } from "@emotion/react";
import type { Theme } from "@mui/material/styles";
import {theme} from "../../src/Theme";
import { Box, Checkbox, TableHead, TableRow, TableCell, TableBody, TableContainer, Table, Typography } from '@mui/material';
import { Tabs, Tab } from '@mui/material';
import { List, ListItem, ListItemButton, MenuItem, TextField } from '@mui/material';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorDisplay } from '../Common/ErrorDisplay';

import { AuthUserContext } from '../../providers/AuthUserProvider';
import { CustomSettingContext } from '../../contexts/CustomSettingContext';
import { ProgramContext } from '../../providers/ProgramProvider';
import { UsersContext, UsersProvider } from '../../providers/UserProvider';
import type { Program } from '../../types/program';
import { SCHOOLS } from '../../types/ui';
import { SUPPORTED_PROGRAMS } from '../../constants';
import { useLocalization } from '../../contexts/localizationUtils';

interface avaliableProgramsProps {
    inUsePrograms: Program[];
    availablePrograms: Program[];
    handleOnClick: (program: Program) => void;
    showCheckbox: boolean;
}

type ProgramManagementTabType = {
    tabName: 'general' | 'school' | 'user',
    label: string,
    displayToStudents: boolean,
    displayToTeachers: boolean,
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    id: `setting-tab-${index}`,
    'aria-controls': `setting-tabpanel-${index}`,
  };
}


function ProgramManagementTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="programmanagementtabpanel"
      hidden={value !== index}
      id={`programmanagement-tabpanel-${index}`}
      aria-labelledby={`programmanagement-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ShowPrograms: React.FC<avaliableProgramsProps> = ({
    inUsePrograms, availablePrograms, handleOnClick, showCheckbox
}) => {

    interface HeadCell {
    disablePadding: boolean;
    id: keyof Program;
    label: string;
    numeric: boolean;
    }

    const headCells: readonly HeadCell[] = [
    {
        id: 'name',
        numeric: false,
        disablePadding: true,
        label: 'settingModal.programSelection.programName',
    },
    {
        id: 'description',
        numeric: false,
        disablePadding: false,
        label: 'settingModal.programSelection.description',
    },
    {
        id: 'feedback',
        numeric: false,
        disablePadding: false,
        label: 'settingModal.programSelection.feedback',
    }
    ];

    const ProgramTableHead = () => {
        return (
            <TableHead>
                <TableRow>
                    { showCheckbox && <TableCell padding="checkbox" /> }
                    {headCells.map((headCell) => (
                        <TableCell
                            key={headCell.id}
                            padding={headCell.disablePadding ? 'none' : 'normal'}
                        >
                            {headCell.label}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        )
    }

    const ProgramTableBody = () => {
        return (
            <Box css={programTableStyle(theme)}>
            <ProgramTableHead />
                <TableBody>
                {availablePrograms.map((program) => {
                    const isItemUsable = program && inUsePrograms.findIndex((p) => p.id === program.id) !== -1;
                    return (
                        <TableRow
                            hover
                            onClick={() => handleOnClick(program)}
                            selected={isItemUsable}
                            key={program.id}
                            role="checkbox"
                            aria-checked={isItemUsable}
                        >
                            { showCheckbox && 
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        css={checkBoxStyle(theme)}
                                        checked={isItemUsable}
                                    />
                                </TableCell>
                            }
                            <TableCell padding="none">
                                {
                                  program.name && (program.name in SUPPORTED_PROGRAMS)
                                    ? SUPPORTED_PROGRAMS[program.name as keyof typeof SUPPORTED_PROGRAMS].name
                                    : program.name
                                }
                            </TableCell>
                            <TableCell>{program.description}</TableCell>
                            <TableCell>{program.feedback.split("+").join(", ")}</TableCell>
                        </TableRow>
                    )
                })}
                </TableBody>
            </Box>
        )
    }

    return (
        <Box>
            <TableContainer>
                <Table sx={{ width: '100%' }} aria-label="program selection table">
                    <ProgramTableBody />
                </Table>
            </TableContainer>
        </Box>
    )
}

interface SelectListItem {
    id: number;
    name: string;
}

interface SelectListProps {
    names: SelectListItem[];
    curSelected: SelectListItem;
    setCurSelected: (name: SelectListItem) => void;
}

const SelectList: React.FC<SelectListProps> = ({ names, curSelected, setCurSelected }) => {
    return (
        <List sx={{ height: '100%', overflow: 'auto' }}>
            {names.map((item) => (
                <ListItem key={item.id} disablePadding>
                    <ListItemButton
                    css={selectListItemStyle(theme)}
                    selected={curSelected.id === item.id}
                    onClick={() => setCurSelected(item)}
                    >
                        {item.name}
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    )
}

const DropDownSelect: React.FC<SelectListProps> = ({ names, curSelected, setCurSelected }) => {
    return (
        <TextField 
            hiddenLabel
            variant="filled"
            size="small"
            css={menuSettingStyle}
            select 
            defaultValue={curSelected}
            onChange={(e) => {
                const selectedName = e.target.value as keyof typeof names;
                setCurSelected(names.find(name => name.name === selectedName) || names[0]);
            }}
        >
            {names.map((item) => (
                <MenuItem key={item.id} value={item.name}>
                    {item.name}
                </MenuItem>
            ))}
        </TextField>
    )
}

const GeneralProgramManagement: React.FC = () => {
    const {
        availablePrograms, programListLoading, fetchPrograms, 
        setCheckingUserId, isUserLoading,
        userPrograms, fetchUserPrograms, addUserProgram, deleteUserProgram

    } = useContext(ProgramContext)
    const { currentUser } = useContext(AuthUserContext);
    const [ errorKey, setErrorKey ] = useState<string | null>(null);

    useEffect(() => {
        setErrorKey(null);
        if (typeof fetchPrograms !== 'function' || !currentUser) return;
        fetchPrograms().catch((e) => {
            console.log(e);
            setErrorKey('settingModal.programSelection.error.fetch_programs_error');
        });
        setCheckingUserId(currentUser.id);
        fetchUserPrograms().catch((e) => {
            console.log(e);
            setErrorKey('settingModal.programSelection.error.fetch_user_programs_error');
        });
    }, [currentUser]);

    const handleOnClick = (program: Program) => {
        const isProgramAdded = userPrograms.findIndex((p) => p.id === program.id) !== -1;
        if (isProgramAdded) {
            deleteUserProgram(program.id).catch((e) => {
                console.log(e);
                setErrorKey('settingModal.programSelection.error.delete_user_program_error');
            }
            );
        } else {
            addUserProgram(program.id).catch((e) => {
                console.log(e);
                setErrorKey('settingModal.programSelection.error.add_user_program_error');
            });
        }
    };

    if (errorKey) {
        return <ErrorDisplay messageKey={errorKey} />;
    }
    if (programListLoading || isUserLoading) {
        return <LoadingSpinner />;
    }

    return (
        <ShowPrograms
            inUsePrograms={userPrograms}
            availablePrograms={availablePrograms}
            handleOnClick={handleOnClick}
            showCheckbox={currentUser?.user_type === 'instructor' || currentUser?.is_admin || false}
        />
    )
}

const SchoolProgramManagement: React.FC = () => {
    const schoolRecords: SelectListItem[] = [];
    const { compactMode } = useContext(CustomSettingContext);
    SCHOOLS.forEach((school, index) => {
        schoolRecords.push({ id: index, name: school });
    });
    const { currentUser } = useContext(AuthUserContext);
    const {
        availablePrograms, programListLoading, fetchPrograms, 
        checkingSchoolName, setCheckingSchoolName,
        schoolPrograms, fetchSchoolPrograms, addSchoolProgram, deleteSchoolProgram,
        isSchoolLoading
    } = useContext(ProgramContext);
    const [ errorKey, setErrorKey ] = useState<string | null>(null);
    const [ selectedSchool, setSelectedSchool ] = useState<SelectListItem>(schoolRecords[0]);

    const handleOnClick = (program: Program) => {
        const isProgramAdded = schoolPrograms.findIndex((p) => p.id === program.id) !== -1;
        if (isProgramAdded) {
            deleteSchoolProgram(program.id).catch((e) => {
                console.log(e);
            }
            );
        } else {
            addSchoolProgram(program.id).catch((e) => {
                console.log(e);
            });
        }
    };

    const setSelected = (selected: SelectListItem) => {
        setSelectedSchool(selected);
        setCheckingSchoolName(selected.name);
    }

    useEffect(() => {
        setErrorKey(null);
        if (typeof fetchPrograms !== 'function' || !currentUser) return;
        if (checkingSchoolName === '') {
            setSelected(
                schoolRecords.find(school => school.name === currentUser?.school) || schoolRecords[0]
            )
        }
        fetchPrograms().catch((e) => {
            console.log(e);
            setErrorKey('settingModal.programSelection.error.fetch_programs_error');
        });
        fetchSchoolPrograms().catch((e) => {
            console.log(e);
            setErrorKey('settingModal.programSelection.error.fetch_school_programs_error');
        });
    }, [currentUser, checkingSchoolName]);

    if (programListLoading || isSchoolLoading) {
        return <LoadingSpinner />;
    }

    if (errorKey) {
        return <ErrorDisplay messageKey={errorKey} />;
    }

    if (compactMode) {
        return (
            <>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
                <Box>
                    <DropDownSelect 
                        names={schoolRecords}
                        curSelected={selectedSchool}
                        setCurSelected={setSelected}
                    />
                </Box>
                <Box>
                    <ShowPrograms
                        inUsePrograms={schoolPrograms}
                        availablePrograms={availablePrograms}
                        handleOnClick={handleOnClick}
                        showCheckbox={currentUser?.is_admin || false}
                    />
                </Box>

            </Box>
            </>
        )
    }

    return (
        <>
        <Box sx={{ display: 'flex', flexDirection: 'row', height: '80vh' }}>
            <Box sx={{ width: '20%'}}>
                <SelectList 
                    names={schoolRecords}
                    curSelected={selectedSchool}
                    setCurSelected={setSelected}
                />
            </Box>
            <Box sx={{ width: '80%'}}>
                <ShowPrograms
                    inUsePrograms={schoolPrograms}
                    availablePrograms={availablePrograms}
                    handleOnClick={handleOnClick}
                    showCheckbox={currentUser?.is_admin || false}
                />
            </Box>

        </Box>
        </>
    )
}

const UserProgramManagement: React.FC = () => {
    const [ userRecord, setUserRecord ] = useState<SelectListItem[]>([]);
    const { compactMode } = useContext(CustomSettingContext);
    const { currentUser } = useContext(AuthUserContext);
    const {
        availablePrograms, programListLoading, fetchPrograms, 
        checkingUserId, setCheckingUserId,
        userPrograms, fetchUserPrograms, addUserProgram, deleteUserProgram,
        isUserLoading
    } = useContext(ProgramContext);
    const { users, setListParams, fetchUsers, fetchStats } = useContext(UsersContext);
    const [ errorKey, setErrorKey ] = useState<string | null>(null);
    const [ isUserListLoading, setIsUserListLoading ] = useState<boolean>(false);
    const [ selectedUser, setSelectedUser ] = useState<SelectListItem>({ id: 0, name: ''});

    const handleOnClick = (program: Program) => {
        const isProgramAdded = userPrograms.findIndex((p) => p.id === program.id) !== -1;
        if (isProgramAdded) {
            deleteUserProgram(program.id).catch((e) => {
                console.log(e);
            }
            );
        } else {
            addUserProgram(program.id).catch((e) => {
                console.log(e);
            });
        }
    };

    const handleUserSelect = (user: SelectListItem) => {
        setSelectedUser(user);
        setCheckingUserId(user.id);
    }

    useEffect(() => {
        let mounted = true;
        setErrorKey(null);
        setIsUserListLoading(true);
        if (typeof fetchStats !== 'function' || typeof fetchUsers !== 'function') {
            setIsUserListLoading(false);
            return;
        }

        (async () => {
            try {
                const stats = await fetchStats();
                const n_users = stats?.n_users ?? 0;
                if (n_users > 0) {
                    if (typeof setListParams === 'function') {
                        setListParams({ skip: 0, limit: n_users });
                    }

                    const fetched = await fetchUsers();
                    const sourceUsers = Array.isArray(fetched) ? fetched : users;

                    const draftUsers = sourceUsers.map((user) => {
                        if (currentUser?.is_admin) {
                            return { id: user.id, name: user.username ? user.username : user.id.toString() };
                        }
                        return { id: user.id, name: user.profiles?.display_name ?? '' };
                    });

                    if (mounted) setUserRecord(draftUsers);
                }
            } catch (e) {
                console.log(e);
                setErrorKey('settingModal.programSelection.error.fetch_user_stats_error');
            } finally {
                if (mounted) setIsUserListLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, [currentUser]);
    
    useEffect(() => {
        setErrorKey(null);
        if (typeof fetchPrograms !== 'function' || !currentUser) return;
        
        if (checkingUserId <= 0) {
            setCheckingUserId(currentUser?.id || 0);
        }

        fetchPrograms().catch((e) => {
            console.log(e);
            setErrorKey('settingModal.programSelection.error.fetch_programs_error');
        });
        fetchUserPrograms().catch((e) => {
            console.log(e);
            setErrorKey('settingModal.programSelection.error.fetch_user_programs_error');
        });
    }, [currentUser, checkingUserId]);

    if (programListLoading || isUserLoading || isUserListLoading) {
        return <LoadingSpinner />;
    }

    if (errorKey) {
        return <ErrorDisplay messageKey={errorKey} />;
    }

    if (compactMode) {
        return (
            <>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
                <Box>
                    <DropDownSelect 
                        names={userRecord}
                        curSelected={selectedUser}
                        setCurSelected={handleUserSelect}
                    />
                </Box>
                <Box>
                    <ShowPrograms
                        inUsePrograms={userPrograms}
                        availablePrograms={availablePrograms}
                        handleOnClick={handleOnClick}
                        showCheckbox={currentUser?.is_admin || false}
                    />
                </Box>

            </Box>
            </>
        )
    }

    return (
        <>
        <Box sx={{ display: 'flex', flexDirection: 'row', height: '80vh' }}>
            <Box sx={{ width: '20%'}}>
                <SelectList 
                    names={userRecord}
                    curSelected={selectedUser}
                    setCurSelected={handleUserSelect}
                />
            </Box>
            <Box sx={{ width: '80%'}}>
                <ShowPrograms
                    inUsePrograms={userPrograms}
                    availablePrograms={availablePrograms}
                    handleOnClick={handleOnClick}
                    showCheckbox={currentUser?.is_admin || false}
                />
            </Box>

        </Box>
        </>
    )
}

interface ManagementTabsProps {
    value: number;
    setValue: (value: number) => void;
}


const ManagementTabs: React.FC<ManagementTabsProps> = ({ value, setValue }) => {
  const { t } = useLocalization();
  const { currentUser } = useContext(AuthUserContext);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const renderManagementTab = (tabName: string) => {
    switch (tabName) {
      case 'general':
        return (
            <GeneralProgramManagement />
      );
      case 'school':
        return (
            <SchoolProgramManagement />
        );
      case 'user':
        return (
            <UsersProvider>
                <UserProgramManagement />
            </UsersProvider>
        );
      default:
        return null;
    }
  }
  
  const programManagementTabs: ProgramManagementTabType[] = [
    { tabName: 'general', label: 'settingModal.programSelection.generalProgramManagement', displayToStudents: true, displayToTeachers: true },
    { tabName: 'school', label: 'settingModal.programSelection.schoolProgramManagement', displayToStudents: false, displayToTeachers: false },
    { tabName: 'user', label: 'settingModal.programSelection.userProgramManagement', displayToStudents: false, displayToTeachers: true },
  ];

  const viewableTabs = () => {
    if (currentUser?.is_admin) {
        return programManagementTabs;
    } else if (currentUser?.user_type === 'instructor') {
        return programManagementTabs.filter(tab => tab.displayToTeachers);
    } else {
        return programManagementTabs.filter(tab => tab.displayToStudents);
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
              backgroundColor: theme.palette.primary.dark, // desired color
              height: 3, // optional: indicator thickness
            },
          }}
        >
          {viewableTabs().map((tab, index) => (
            <Tab css={tabStyle(theme)} key={tab.tabName} label={
                <>
                  <span>{t(tab.label)}</span>
                </>
            } {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ overflowY: 'auto', height: 'calc(90vh - 100px)' }}>
      {
        viewableTabs().map((tab, index) => (
          <ProgramManagementTabPanel value={value} index={index} key={tab.tabName}>
            { renderManagementTab(tab.tabName) }
          </ProgramManagementTabPanel>
        ))
      }
      </Box>
    </Box>
  );
}

export const ProgramSelectionTab: React.FC = () => {
    const { currentUser } = useContext(AuthUserContext);
    const [tabValue, setTabValue] = useState(0);

    if (!currentUser) {
        return <LoadingSpinner />;
    }
    return (
        <Box sx={{ width: '100%' }}>
            <ManagementTabs value={tabValue} setValue={setTabValue} />
        </Box>
    )
}

const tabStyle = (theme: Theme) => css`
  color: ${theme.palette.primary.main};
  &.Mui-selected {
    color: ${theme.palette.primary.dark};
  }
`;

const selectListItemStyle = (theme: Theme) => css`
  background-color: ${theme.palette.background.paper};
  &.Mui-selected {
    background-color: ${theme.palette.primary.light};
  }
`;

const programTableStyle = (theme: Theme) => css`
    background-color: ${theme.palette.background.paper};
`;

const menuSettingStyle = css`
    border-radius: 8px;
    margin: 10px;
    width: calc(100% - 32px);
`;

const checkBoxStyle = (theme: Theme) => css`
    color: ${theme.palette.secondary.light};
    &.Mui-checked {
        color: ${theme.palette.secondary.dark};
    }
`;