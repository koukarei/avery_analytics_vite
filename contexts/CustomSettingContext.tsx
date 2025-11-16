import React, { useState, useContext, createContext, useEffect } from 'react';
import { ProgramAPI } from '../api/Program';
import type { Program } from '../types/program';
import { AuthUserContext } from '../providers/AuthUserProvider';

const defaultValue = {
    showStudentNames: false,
}

type CustomSettingContextType = {
    showStudentNames: boolean;
    setShowStudentNames: (value: boolean) => void;
    curProgram: Program | null;
    setCurProgram: (program: Program | null) => void;
    isInitialized: boolean;
};

export const CustomSettingContext = createContext({
    ...defaultValue,
    setShowStudentNames: () => {},
    curProgram: null,
    setCurProgram: () => {},
    isInitialized: false,
} as CustomSettingContextType);

export const CustomSettingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
    const [ showStudentNames, setShowStudentNames ] = useState(false);
    const [ curProgram, setCurProgram ] = useState<Program | null>(null);
    const programName = () => {
        const saved = sessionStorage.getItem("program");
        return saved || "";
    };
    const { currentUser } = useContext(AuthUserContext);
    const [ isInitialized, setIsInitialized ] = useState<boolean>(false);

    const contextValue = {
        showStudentNames,
        setShowStudentNames,
        curProgram,
        setCurProgram,
        isInitialized,
    };

    useEffect(() => {
        setIsInitialized(false);
        try {
            ProgramAPI.fetchProgramList().then((programs) => {
                if (programs.length > 0) {
                    setCurProgram(programs[0]);
                    const savedProgram = programs.find(p => p.name === programName);
                    if (savedProgram) {
                        setCurProgram(savedProgram);
                    }
                }
            });
        } catch (error) {
            console.error("Failed to fetch program list:", error);
        } finally {
            setIsInitialized(true);
        }
    }, [currentUser])

    return (
        <CustomSettingContext.Provider value={contextValue}>
            {children}
        </CustomSettingContext.Provider>
    );
};

