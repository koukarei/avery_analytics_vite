import type { 
    wsTokenResponse
 } from "../types/websocketAPI";
import { authAxios } from "./axios";

export class wsAPI {
  static async fetchWsToken(): Promise<wsTokenResponse | null> {
    const response = await authAxios.post(`ws_token`, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    if (response.status !== 200) {
      return null;
    };
    return response.data;
  }
}
