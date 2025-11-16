import React, { createContext, useState, useEffect, useCallback } from "react";
import type { Program } from '../types/program';
import { ProgramAPI } from "../api/Program";

type ProgramContextType = {
  availablePrograms: Program[];
  programListLoading: boolean;
  fetchPrograms: () => Promise<Program[]>;

  checkingSchoolName: string;
  setCheckingSchoolName: (name: string) => void;

  schoolPrograms: Program[];
  isSchoolLoading: boolean;
  fetchSchoolPrograms: () => Promise<Program[]>;

  addSchoolProgram: (programId: number) => Promise<void>;
  deleteSchoolProgram: (programId: number) => Promise<void>;

  checkingUserId: number;
  setCheckingUserId: (id: number) => void;

  userPrograms: Program[];
  isUserLoading: boolean;
  fetchUserPrograms: () => Promise<Program[]>;

  addUserProgram: (programId: number) => Promise<void>;
  deleteUserProgram: (programId: number) => Promise<void>;
};

export const ProgramContext = createContext({} as ProgramContextType);

export const ProgramProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [availablePrograms, setAvailablePrograms] = useState<Program[]>([]);
  const [programListLoading, setProgramListLoading] = useState<boolean>(false);
  const [checkingSchoolName, setCheckingSchoolName] = useState<string>("");
  const [schoolPrograms, setSchoolPrograms] = useState<Program[]>([]);
  const [checkingUserId, setCheckingUserId] = useState<number>(0);
  const [userPrograms, setUserPrograms] = useState<Program[]>([]);

  const [isSchoolLoading, setIsSchoolLoading] = useState<boolean>(false);
  const [isUserLoading, setIsUserLoading] = useState<boolean>(false);

  const fetchPrograms = useCallback(async () => {
    let programs: Program[] = [];
    setProgramListLoading(true);
    try {
      programs = await ProgramAPI.fetchProgramList();
      setAvailablePrograms(programs);
    } catch (e) {
      console.log(e);
    } finally {
      setProgramListLoading(false);
    }
    return programs;
  }, []);

  const fetchSchoolPrograms = async () => {
    let programs: Program[] = [];
    setIsSchoolLoading(true);
    try {
      programs = await ProgramAPI.fetchSchoolPrograms(checkingSchoolName);
      setSchoolPrograms(programs);
    } catch (e) {
      console.log(e);
    } finally {
      setIsSchoolLoading(false);
    }
    return programs;
  };

  const fetchUserPrograms = async () => {
    let programs: Program[] = [];
    setIsUserLoading(true);
    try {
      programs = await ProgramAPI.fetchUserPrograms(checkingUserId);
      setUserPrograms(programs);
    } catch (e) {
      console.log(e);
    } finally {
      setIsUserLoading(false);
    }
    return programs;
  };

  useEffect(() => {
    if (checkingSchoolName !== "") {
      fetchSchoolPrograms();
    }
  }, [checkingSchoolName]);

  useEffect(() => {
    if (checkingUserId > 0) {
      fetchUserPrograms();
    }
  }, [checkingUserId]);

  const addSchoolProgram = async (programId: number) => {
    try {
      await ProgramAPI.addSchoolProgram(checkingSchoolName, programId);
      fetchSchoolPrograms();
    } catch (e) {
      console.log(e);
    }
  };

  const deleteSchoolProgram = async (programId: number) => {
    try {
      await ProgramAPI.deleteSchoolProgram(checkingSchoolName, programId);
      fetchSchoolPrograms();
    } catch (e) {
      console.log(e);
    }
  };

  const addUserProgram = async (programId: number) => {
    try {
      await ProgramAPI.addUserProgram(checkingUserId, programId);
      fetchUserPrograms();
    } catch (e) {
      console.log(e);
    }
  };

  const deleteUserProgram = async (programId: number) => {
    try {
      await ProgramAPI.deleteUserProgram(checkingUserId, programId);
      fetchUserPrograms();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <ProgramContext.Provider value={{
      availablePrograms, 
      programListLoading, 
      fetchPrograms,
      checkingSchoolName,
      setCheckingSchoolName,
      schoolPrograms,
      isSchoolLoading,
      fetchSchoolPrograms,
      addSchoolProgram,
      deleteSchoolProgram,
      checkingUserId,
      setCheckingUserId,
      userPrograms,
      isUserLoading,
      fetchUserPrograms,
      addUserProgram,
      deleteUserProgram,
    }}>
      {children}
    </ProgramContext.Provider>
  );
};
