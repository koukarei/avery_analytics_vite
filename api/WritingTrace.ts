import type { WritingTrace } from "../types/studentWork";
import { authAxios } from "./axios";

export class WritingTraceAPI {

  static async createWritingTrace(data: WritingTrace): Promise<WritingTrace> {
    const response = await authAxios.post("writing_traces/", data, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    if (response.status !== 201) {
      throw new Error(`Error creating writing trace: ${response.statusText}`);
    }
    return data;
  }

}