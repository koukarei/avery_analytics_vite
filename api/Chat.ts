import { ChatRecord, ChatMessage, ChatStats } from "../types/studentWork";
import { authAxios } from "./axios";

export class ChatAPI {

  static async fetchChat(round_id: number): Promise<ChatRecord> {
    const response = await authAxios.get(`chat/${round_id}/`, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async GetChatStats(round_id: number): Promise<ChatStats> {
    const response = await authAxios.get(`chat/${round_id}/stats/`, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    if (response.status !== 200) {
      throw new Error(`Error fetching chat stats: ${response} `);
    }
    return response.data;
  }
}