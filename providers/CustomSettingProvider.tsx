import React, { useState, createContext } from 'react';

const defaultValue = {
    showStudentNames: false,
}

type CustomSettingContextType = {
    showStudentNames: boolean;
    setShowStudentNames: (value: boolean) => void;
};

export const CustomSettingContext = createContext({
    ...defaultValue,
    setShowStudentNames: () => {},
} as CustomSettingContextType);

export const CustomSettingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
    const [showStudentNames, setShowStudentNames] = useState(false);

    const contextValue = {
        showStudentNames,
        setShowStudentNames,
    };

    return (
        <CustomSettingContext.Provider value={contextValue}>
            {children}
        </CustomSettingContext.Provider>
    );
};

