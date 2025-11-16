import type { ProgramBase, Program, ProgramListParam } from "../types/program";
import { authAxios } from "./axios";

export class ProgramAPI {
  static async fetchProgramList(): Promise<Program[]> {
    const response = await authAxios.get("programs/", {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async createProgram(data: ProgramBase): Promise<Program> {
    const response = await authAxios.post("program", data, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async fetchSchoolPrograms(schoolName: string): Promise<Program[]> {
    const response = await authAxios.get(`school/programs/?school=${schoolName}`, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async addSchoolProgram(schoolName: string, programId: number): Promise<Program> {
    const response = await authAxios.post(`school/program`, {
      school: schoolName,
      program_id: programId
    }, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async deleteSchoolProgram(schoolName: string, programId: number): Promise<Program> {
    const response = await authAxios.delete(`school/program`, {
      data: {
        school: schoolName,
        program_id: programId
      },
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async fetchUserPrograms(user_id: number): Promise<Program[]> {
    const response = await authAxios.get(`users/${user_id}/program`, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async addUserProgram(user_id: number, program_id: number): Promise<Program> {
    const response = await authAxios.post(`users/${user_id}/program`, {
      user_id: user_id,
      program_id: program_id
    }, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async deleteUserProgram(user_id: number, program_id: number): Promise<void> {
    const response = await authAxios.delete(`users/${user_id}/program`, {
        data: {
            user_id: user_id,
            program_id: program_id
        },
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    if (response.status !== 200){
        throw new Error(`Error deleting user program: ${response} `);
    }
    return;
  }
}