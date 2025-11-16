import React, { createContext, useState, useEffect, useCallback } from "react";
import type { Program, ProgramListParam, ProgramBase } from '../types/program';
import { ProgramAPI } from "../api/Program";

type ProgramContextType = {
  availablePrograms: Program[];
  programListLoading: boolean;
  fetchPrograms: () => Promise<void>;

  checkingSchoolName: string;
  setCheckingSchoolName: (name: string) => void;

  schoolPrograms: Program[];
  fetchSchoolPrograms: (schoolName: string) => Promise<void>;

  addSchoolProgram: (programId: number) => Promise<void>;
  deleteSchoolProgram: (programId: number) => Promise<void>;

  checkingUserId: number;
  setCheckingUserId: (id: number) => void;

  userPrograms: Program[];
  fetchUserPrograms: (userId: number) => Promise<void>;

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


  const programs = [
    {
      value: "inlab_test",
      label: "InLab テストプログラム",
    },
    {
      value: "student_1_sem_awe",
      label: "自動評価プログラム",
    },
    {
      value: "student_1_sem_img",
      label: "画像生成プログラム",
    },
    {
      value: "student_2_sem",
      label: "自動評価・画像生成プログラム",
    },
  ];
  const fetchPrograms = useCallback(async () => {
    setProgramListLoading(true);
    try {
      const programList = await ProgramAPI.fetchProgramList();
      setAvailablePrograms(programList);
    } catch (e) {
      console.log(e);
    }
    setProgramListLoading(false);
  }, []);

  const fetchSchoolPrograms = async () => {
    try {
      const programs = await ProgramAPI.fetchSchoolPrograms(checkingSchoolName);
      setSchoolPrograms(programs);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchUserPrograms = async () => {
    try {
      const programs = await ProgramAPI.fetchUserPrograms(checkingUserId);
      setUserPrograms(programs);
    } catch (e) {
      console.log(e);
    }
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
      fetchSchoolPrograms,
      addSchoolProgram,
      deleteSchoolProgram,
      checkingUserId,
      setCheckingUserId,
      userPrograms,
      fetchUserPrograms,
      addUserProgram,
      deleteUserProgram,
    }}>
      {children}
    </ProgramContext.Provider>
  );
};
