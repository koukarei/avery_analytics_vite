import type { RevisionUpdate } from "../types/studentWork";
import { authAxios } from "./axios";

interface RevisionOperation {
  name: 'zero_corrections' | 'effective_corrections' | 'deletion' | 'substitution' | 'reorganization' | 'rewriting';
  checked: boolean;
}

interface RevisionOperations {
    id: number;
    operations: RevisionOperation[];
}

export class RevisionAPI {

  static async fetchRevisionOperations(generation_id: number): Promise<RevisionOperations> {
    const response = await authAxios.get(`revision/${generation_id}/`, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }
    static async updateRevision(data: RevisionUpdate): Promise<RevisionOperations> {
    const response = await authAxios.put(`revision/${data.id}/`, data, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }
}