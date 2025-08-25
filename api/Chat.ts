import { ChatRecord, ChatMessage } from "../types/studentWork";
import { authAxios } from "./axios";

export class ChatAPI {

  static async fetchChat(round_id: number): Promise<ChatRecord> {
    const response = await authAxios.get(`round/${round_id}/chat/`, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async sendMessage(round_id: number, data: ChatMessage): Promise<ChatRecord> {
    const response = await authAxios.put(`round/${round_id}/chat/`, data, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }
}