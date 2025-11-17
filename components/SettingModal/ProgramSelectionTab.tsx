/** @jsxImportSource @emotion/react */
import React, { useState, useContext, useEffect } from 'react';
import { css } from "@emotion/react";
import type { Theme } from "@mui/material/styles";
import {theme} from "../../src/Theme";
import { Box, Checkbox, TableHead, TableRow, TableCell, TableBody, TableContainer, Table } from '@mui/material';
import { Tabs, Tab } from '@mui/material';
import { List, ListItem, ListItemButton, MenuItem, TextField } from '@mui/material';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorDisplay } from '../Common/ErrorDisplay';

import { AuthUserContext } from '../../providers/AuthUserProvider';
import { CustomSettingContext } from '../../contexts/CustomSettingContext';
import { ProgramContext, ProgramProvider } from '../../providers/ProgramProvider';
import { UsersContext, UsersProvider } from '../../providers/UserProvider';
import type { Program } from '../../types/program';
import { SCHOOLS } from '../../types/ui';
import { SUPPORTED_PROGRAMS } from '../../constants';
import { useLocalization } from '../../contexts/localizationUtils';
import { ProgramAPI } from '../../api/Program';

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
    const { t } = useLocalization();
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
                            {t(headCell.label)}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        )
    }

    const ProgramTableBody = () => {
        return (
            <TableBody>
                {availablePrograms.map((program) => {
                    const isItemUsable = program && inUsePrograms.findIndex((p) => p.id === program.id) !== -1;
                    return (
                        <TableRow
                            hover
                            onClick={showCheckbox ? () => handleOnClick(program) : undefined}
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
        )
    }

    return (
        <Box css={programTableStyle(theme)}>
            <TableContainer>
                <Table sx={{ width: '100%' }} aria-label="program selection table">
                    <ProgramTableHead />
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
    curSelected: SelectListItem[];
    setCurSelected: (names: SelectListItem[]) => void;
}

const SelectList: React.FC<SelectListProps> = ({ names, curSelected, setCurSelected }) => {
    const [startListIndex, setStartListIndex] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragPerformed, setDragPerformed] = useState(false);

    const handleItemClick = (event: React.MouseEvent | React.KeyboardEvent, item: SelectListItem, index: number) => {
        // if we just performed a drag-based selection, ignore the click that follows
        if ((event as React.MouseEvent).type === 'click' && dragPerformed) {
            setDragPerformed(false);
            return;
        }

        const isSelected = curSelected.findIndex(selected => selected.id === item.id) !== -1;

        // Ctrl / Cmd multi-select
        if ('ctrlKey' in event && (event.ctrlKey || (event as any).metaKey)) {
            if (!isSelected) {
                setCurSelected([...curSelected, item]);
            } else {
                setCurSelected(curSelected.filter(s => s.id !== item.id));
            }
            return;
        }

        // Shift range-select (only when Shift is held)
        if ('shiftKey' in event && event.shiftKey) {
            // use existing anchor if set, otherwise fall back to current selection's first item
            const anchorIndex = startListIndex ?? (curSelected[0] ? names.findIndex(n => n.id === curSelected[0].id) : null);
            if (anchorIndex === null || anchorIndex === undefined) {
                setStartListIndex(index);
                setCurSelected([item]);
                return;
            }
            const [from, to] = anchorIndex < index ? [anchorIndex, index] : [index, anchorIndex];
            const range = names.slice(from, to + 1);
            setCurSelected([
                ...curSelected,
                ...range.filter(n => !curSelected.find(s => s.id === n.id))
            ]);
            return;
        }

        // Default single select (click or Enter) — set start anchor
        setCurSelected([item]);
        setStartListIndex(index);
    };

    const handleKeyDown = (event: React.KeyboardEvent, item: SelectListItem, index: number) => {
        // Enter selects, Shift sets anchor
        if (event.key === 'Enter') {
            handleItemClick(event, item, index);
        } else if (event.key === 'Shift') {
            setStartListIndex(index);
        }
    };

    const handleKeyUp = (event: React.KeyboardEvent, item: SelectListItem, index: number) => {
        // on Shift release, perform range select
        if (event.key === 'Shift') {
            handleItemClick(event, item, index);
        }
    };

    const handleMouseDown = (event: React.MouseEvent, index: number) => {
        // set anchor on mousedown and start dragging
        if (event.type === "mousedown") {
            if (!event.shiftKey) {
                setStartListIndex(index);
                setIsDragging(true);
            }
        }
    };

    const handleMouseUp = (event: React.MouseEvent, index: number) => {
        // if we were dragging, perform a range selection between anchor and this index
        if (!isDragging) return;
        setIsDragging(false);

        const anchor = startListIndex ?? index;
        const [from, to] = anchor < index ? [anchor, index] : [index, anchor];
        const range = names.slice(from, to + 1);

        // If shift held, append the range; otherwise replace selection with the range
        if (event.shiftKey) {
            setCurSelected([
                ...curSelected,
                ...range.filter(n => !curSelected.find(s => s.id === n.id))
            ]);
        } else if (event.ctrlKey || event.metaKey) {
            // ctrl + drag -> toggle items in range
            const toggled = [...curSelected];
            range.forEach(
                r => {
                    const idx = toggled.findIndex(s => s.id === r.id);
                    if (idx === -1) toggled.push(r);
                    else toggled.splice(idx, 1);
                }
            )
            setCurSelected(toggled);
        } else {
            setCurSelected(range);
        }

        // prevent the subsequent click handler from toggling selection again
        setDragPerformed(true);
    };


    return (
        <List sx={{ height: '100%', overflow: 'auto' }}>
            {names.map((item, index) => (
                <ListItem key={item.id} disablePadding>
                    <ListItemButton
                        onKeyDown={(e) => handleKeyDown(e, item, index)}
                        onKeyUp={(e) => handleKeyUp(e, item, index)}
                        onMouseDown={(e) => handleMouseDown(e, index)}
                        onMouseUp={(e) => handleMouseUp(e, index)}
                        onClick={(e) => handleItemClick(e, item, index)}
                        css={selectListItemStyle(theme)}
                        selected={curSelected.findIndex(selected => selected.id === item.id) !== -1}
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
                setCurSelected([names.find(name => name.name === selectedName) || names[0]]);
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
        checkingUserId, setCheckingUserId, isUserLoading,
        userPrograms, fetchUserPrograms, addUserProgram, deleteUserProgram

    } = useContext(ProgramContext)
    const { currentUser } = useContext(AuthUserContext);
    const [ errorKey, setErrorKey ] = useState<string | null>(null);
    const [ isLoading, setIsLoading ] = useState<boolean>(false);

    useEffect(() => {
        let mounted = true;
        setErrorKey(null);
        setIsLoading(true);
        if (typeof fetchPrograms !== 'function' || !currentUser) {
            setIsLoading(false);
            return;
        }

        (async () => {
            try {
                fetchPrograms().catch((e) => {
                    console.log(e);
                    setErrorKey('settingModal.programSelection.error.fetch_programs_error');
                });
                setCheckingUserId(currentUser.id);
                fetchUserPrograms().catch((e) => {
                    console.log(e);
                    setErrorKey('settingModal.programSelection.error.fetch_user_programs_error');
                });

                if (mounted) setIsLoading(false);

            } catch (e) {
                console.log(e);
                setErrorKey('settingModal.programSelection.error.fetch_user_stats_error');
            }
        })();
        return () => { mounted = false; }
    }, [currentUser, checkingUserId]);

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
    
    if (programListLoading || isUserLoading || isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <>
            {errorKey && <ErrorDisplay messageKey={errorKey} />}
            <ShowPrograms
                inUsePrograms={userPrograms}
                availablePrograms={availablePrograms}
                handleOnClick={handleOnClick}
            showCheckbox={currentUser?.user_type === 'instructor' || currentUser?.is_admin || false}
        />
        </>
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
        schoolPrograms, fetchSchoolPrograms, 
        addSchoolProgram, deleteSchoolProgram, 
        isSchoolLoading
    } = useContext(ProgramContext);
    const [ loadedSchoolPrograms, setLoadedSchoolPrograms ] = useState<Program[]>([]);
    const [ errorKey, setErrorKey ] = useState<string | null>(null);
    const [ selectedSchools, setSelectedSchools ] = useState<SelectListItem[]>([]);

    const handleOnClick = async (program: Program) => {
        if (selectedSchools.length > 1) {
            selectedSchools.forEach((school) => {
                ProgramAPI.addSchoolProgram(school.name, program.id).catch((e) => {
                    console.log(e);
                    setErrorKey('settingModal.programSelection.error.add_school_program_error');
                });
            });
            setLoadedSchoolPrograms((prevPrograms) => [...prevPrograms, program]);
        }

        if (selectedSchools.length === 0) {
            return;
        } 
        
        const isProgramAdded = schoolPrograms.findIndex((p) => p.id === program.id) !== -1;
        if (isProgramAdded) {
            try {
                await deleteSchoolProgram(program.id);
                setLoadedSchoolPrograms((prevPrograms) => prevPrograms.filter((p) => p.id !== program.id));
            } catch {
                setErrorKey('settingModal.programSelection.error.delete_school_program_error');
            }
        } else {
            try {
                await addSchoolProgram(program.id);
                setLoadedSchoolPrograms((prevPrograms) => [...prevPrograms, program]);
            } catch {
                setErrorKey('settingModal.programSelection.error.add_school_program_error');
            }
        }
    };

    const setSelected = (selected: SelectListItem[]) => {
        setSelectedSchools([...selected]);
        if (selected.length === 1 ) {
            setCheckingSchoolName(selected[0]?.name || '');
        } else {
            setCheckingSchoolName('');
        }
    }

    useEffect(() => {
        setErrorKey(null);
        if (typeof fetchPrograms !== 'function' || !currentUser) return;

        (async () => {
            try {
                // Fetch programs
                fetchPrograms().catch((e) => {
                    console.log(e);
                    setErrorKey('settingModal.programSelection.error.fetch_programs_error');
                });

                //Fetch school programs
                if (checkingSchoolName === '') {
                    setLoadedSchoolPrograms([]);
                } else {
                    fetchSchoolPrograms().then((programs)=>{
                        setLoadedSchoolPrograms([...programs]);
                    }).catch((e) => {
                        console.log(e);
                        setErrorKey('settingModal.programSelection.error.fetch_school_programs_error');
                    });
                }

            } catch (e) {
                console.log(e);
                setErrorKey('settingModal.programSelection.error.fetch_user_stats_error');
            }
        })();
        
    }, [currentUser, checkingSchoolName]);

    if (programListLoading || isSchoolLoading) {
        return <LoadingSpinner />;
    }

    if (compactMode) {
        return (
            <>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
                {errorKey && <ErrorDisplay messageKey={errorKey} />}
                <Box>
                    <DropDownSelect 
                        names={schoolRecords}
                        curSelected={selectedSchools}
                        setCurSelected={setSelected}
                    />
                </Box>
                <Box>
                    <ShowPrograms
                        inUsePrograms={loadedSchoolPrograms}
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
            {errorKey && <ErrorDisplay messageKey={errorKey} />}
            <Box sx={{ display: 'flex', flexDirection: 'row', height: '80vh' }}>
                <Box sx={{ width: '20%'}}>
                    <SelectList 
                        names={schoolRecords}
                        curSelected={selectedSchools}
                        setCurSelected={setSelected}
                    />
                </Box>
                <Box sx={{ width: '80%'}}>
                    <ShowPrograms
                        inUsePrograms={loadedSchoolPrograms}
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
    const [ selectedUsers, setSelectedUsers ] = useState<SelectListItem[]>([]);
    const [ loadedUserPrograms, setLoadedUserPrograms ] = useState<Program[]>([]);

    const handleOnClick = async (program: Program) => {
        if (selectedUsers.length > 1) {
            selectedUsers.forEach((user) => {
                ProgramAPI.addUserProgram(user.id, program.id).catch((e) => {
                    console.log(e);
                    setErrorKey('settingModal.programSelection.error.add_user_program_error');
                });
            });
            setLoadedUserPrograms((prevPrograms) => [...prevPrograms, program]);
            return;
        } 
        
        if (selectedUsers.length === 0) {
            return;
        } 

        const isProgramAdded = userPrograms.findIndex((p) => p.id === program.id) !== -1;
        if (isProgramAdded) {
            try {
                await deleteUserProgram(program.id);
                setLoadedUserPrograms((prevPrograms) => prevPrograms.filter((p) => p.id !== program.id));
            } catch {
                setErrorKey('settingModal.programSelection.error.delete_user_program_error');
            }
        } else {
            try {
                await addUserProgram(program.id);
                setLoadedUserPrograms((prevPrograms) => [...prevPrograms, program]);
            } catch {
                setErrorKey('settingModal.programSelection.error.add_user_program_error');
            }
        }
    };

    const handleUserSelect = (users: SelectListItem[]) => {
        setSelectedUsers([...users]);
        if (users.length === 1 ) {
            setCheckingUserId(users[0].id);
        } else {
            setCheckingUserId(0);
        }
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

        (async () => {
            try {
                // Fetch programs
                fetchPrograms().catch((e) => {
                    console.log(e);
                    setErrorKey('settingModal.programSelection.error.fetch_programs_error');
                });

                //Fetch school programs
                if (checkingUserId <= 0) {
                    setCheckingUserId(0);
                    setLoadedUserPrograms([]);
                } else {
        
                    fetchUserPrograms().then((program)=>{
                        setLoadedUserPrograms([...program]);
                    }).catch((e) => {
                        console.log(e);
                        setErrorKey('settingModal.programSelection.error.fetch_user_programs_error');
                    });
                }

            } catch (e) {
                console.log(e);
                setErrorKey('settingModal.programSelection.error.fetch_user_stats_error');
            }
        })();
    }, [currentUser, checkingUserId]);

    if (programListLoading || isUserLoading || isUserListLoading) {
        return <LoadingSpinner />;
    }

    if (compactMode) {
        return (
            <>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
                {errorKey && <ErrorDisplay messageKey={errorKey} />}
                <Box>
                    <DropDownSelect 
                        names={userRecord}
                        curSelected={selectedUsers}
                        setCurSelected={handleUserSelect}
                    />
                </Box>
                <Box>
                    <ShowPrograms
                        inUsePrograms={loadedUserPrograms}
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
            {errorKey && <ErrorDisplay messageKey={errorKey} />}
            <Box sx={{ display: 'flex', flexDirection: 'row', height: '80vh' }}>
                <Box sx={{ width: '20%'}}>
                    <SelectList 
                        names={userRecord}
                        curSelected={selectedUsers}
                        setCurSelected={handleUserSelect}
                    />
                </Box>
                <Box sx={{ width: '80%'}}>
                    <ShowPrograms
                        inUsePrograms={loadedUserPrograms}
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
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const renderManagementTab = (tabName: string) => {
    switch (tabName) {
      case 'general':
        return (
            <ProgramProvider>
                <GeneralProgramManagement />
            </ProgramProvider>
      );
      case 'school':
        return (
            <ProgramProvider>
                <SchoolProgramManagement />
            </ProgramProvider>
        );
      case 'user':
        return (
            <ProgramProvider>
                <UsersProvider>
                    <UserProgramManagement />
                </UsersProvider>
            </ProgramProvider>
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

  if (viewableTabs().length === 0) {
    return <ErrorDisplay messageKey="settingModal.programSelection.error.no_permission_to_view_tabs" />;
  }
  if (viewableTabs().length === 1) {
    return (
        <Box sx={{ width: '100%', height: 'calc(90vh - 100px)' }}>
            { renderManagementTab(viewableTabs()[0].tabName) }
        </Box>
    )
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