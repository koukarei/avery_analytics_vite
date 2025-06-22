import { Leaderboard, LeaderboardListParams} from "../types/leaderboard";
import { authAxios } from "./axios";

export class LeaderboardAPI {
  static async fetchLeaderboardList(params: LeaderboardListParams): Promise<Leaderboard[]> {
    const response = await authAxios.get("Leaderboards/", {
      params: params,
      paramsSerializer: { indexes: null },
      headers: sessionStorage.getItem("token")
        ? { Authorization: `Token ${sessionStorage.getItem("token")}` }
        : {},
    });
    return response.data;
  }

  static async fetchLeaderboardDetail(id: number): Promise<Leaderboard> {
    const response = await authAxios.get(`Leaderboards/${id}/`, {
      headers: sessionStorage.getItem("token")
        ? { Authorization: `Token ${sessionStorage.getItem("token")}` }
        : {},
    });
    return response.data;
  }

  static async fetchLeaderboardImage(id: number): Promise<string> {
    const response = await authAxios.get(`Leaderboards/${id}/image/`, {
      responseType: 'arraybuffer',
      headers: sessionStorage.getItem("token")
        ? { Authorization: `Token ${sessionStorage.getItem("token")}` }
        : {},
    });
    
    return `data:image/png;base64,${response.data}`;
  }
}