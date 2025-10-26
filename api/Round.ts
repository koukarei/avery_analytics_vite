import type { Round, RoundUpdate } from "../types/studentWork";
import { authAxios } from "./axios";

export class RoundAPI {
    static async updateRound(data: RoundUpdate): Promise<Round> {
    const response = await authAxios.put(`rounds/${data.id}/display_name`, data, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }
}