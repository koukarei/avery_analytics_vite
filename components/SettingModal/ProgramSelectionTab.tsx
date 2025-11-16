import React, { useState, useContext, useEffect } from 'react';
import { Box, Checkbox, TableHead, TableRow, TableCell, TableBody, TableContainer, Table, Typography } from '@mui/material';
import { List, ListItem, ListItemButton } from '@mui/material';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorDisplay } from '../Common/ErrorDisplay';

import { AuthUserContext } from '../../providers/AuthUserProvider';
import { CustomSettingContext } from '../../contexts/CustomSettingContext';
import { ProgramContext } from '../../providers/ProgramProvider';
import { UserContext } from '../../providers/UserProvider';
import type { Program } from '../../types/program';
import { SCHOOLS } from '../../types/ui';
import { SUPPORTED_PROGRAMS } from '../../constants';

interface avaliableProgramsProps {
    curProgram: Program | null;
    setCurProgram: (program: Program | null) => void;
    availablePrograms: Program[];
}

const ShowPrograms: React.FC<avaliableProgramsProps> = ({
    curProgram, setCurProgram, availablePrograms
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
                    <TableCell padding="checkbox" />
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
            <>
            <ProgramTableHead />
                <TableBody>
                {availablePrograms.map((program) => {
                    const isItemSelected = curProgram ? curProgram.id === program.id : false;
                    return (
                        <TableRow
                            hover
                            onClick={() => setCurProgram(program)}
                            selected={isItemSelected}
                            key={program.id}
                            role="checkbox"
                            aria-checked={isItemSelected}
                        >
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    checked={isItemSelected}
                                />
                            </TableCell>
                            <TableCell padding="none">
                                {
                                  program.name && (program.name in SUPPORTED_PROGRAMS)
                                    ? SUPPORTED_PROGRAMS[program.name as keyof typeof SUPPORTED_PROGRAMS].name
                                    : program.name
                                }
                            </TableCell>
                            <TableCell>{program.description}</TableCell>
                            <TableCell>{program.feedback}</TableCell>
                        </TableRow>
                    )
                })}
                </TableBody>
            </>
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

interface SelectListProps {
    names: Record<number, string>;
    curSelected: string;
    setCurSelected: (name: string) => void;
}

const SelectList: React.FC<SelectListProps> = ({ names, curSelected, setCurSelected }) => {
    return (
        <List>
            {Object.entries(names).map(([id, name]) => (
                <ListItem key={id} disablePadding>
                    <ListItemButton
                    selected={curSelected === name}
                    onClick={() => setCurSelected(name)}
                    >
                        {name}
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    )
}

const SchoolProgramManagement: React.FC = () => {
    const schoolRecords: Record<number, string> = {};
    SCHOOLS.forEach((school, index) => {
        schoolRecords[index] = school;
    });
    const {
        checkingSchoolName, setCheckingSchoolName,
        schoolPrograms, fetchSchoolPrograms, addSchoolProgram, deleteSchoolProgram,
    } = useContext(ProgramContext)

    useEffect(() => {
        fetchSchoolPrograms().catch((e) => {
            console.log(e);
        });
    }, [checkingSchoolName]);

    return (
        <>
        <Typography variant="h6" gutterBottom> School Program Management </Typography>
        <Box>
            <SelectList 
                names={schoolRecords}
                curSelected={checkingSchoolName}
                setCurSelected={setCheckingSchoolName}
             />
        </Box>
        <Box>
            <ShowPrograms
                curProgram={checkingSchoolName}
                setCurProgram={setCheckingSchoolName}
                availablePrograms={[]}
            />
        </Box>
        </>
    )
}

export const ProgramSelectionTab: React.FC = () => {
    const { currentUser } = useContext(AuthUserContext);
    const { curProgram, setCurProgram } = useContext(CustomSettingContext);
    const {
        availablePrograms, programListLoading, fetchPrograms, 
        checkingSchoolName, setCheckingSchoolName,
        schoolPrograms, fetchSchoolPrograms, addSchoolProgram, deleteSchoolProgram,
        checkingUserId, setCheckingUserId,
        userPrograms, fetchUserPrograms, addUserProgram, deleteUserProgram
    } = useContext(ProgramContext)
    const [ errorKey, setErrorKey ] = useState<string | null>(null);

    useEffect(() => {
        setErrorKey(null);
        if (typeof fetchPrograms !== 'function' || !currentUser) return;
        fetchPrograms().catch((e) => {
            console.log(e);
            setErrorKey('fetch_programs_error');
        });
    }, [currentUser]);

    if (errorKey) {
        return <ErrorDisplay messageKey={errorKey} />;
    }
    
    if (!currentUser || programListLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <ShowPrograms curProgram={curProgram} setCurProgram={setCurProgram} availablePrograms={availablePrograms} />

            {currentUser.is_admin && (
                <SchoolProgramManagement />
            )}

            {currentUser.user_type !== 'student' && (
                <h2>User Program Management</h2>
            )}
        </div>
    )
}