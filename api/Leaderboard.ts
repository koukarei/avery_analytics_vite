import { Leaderboard, LeaderboardAnalysis, LeaderboardListParams, LeaderboardAnalysisParams, WordCloudParams} from "../types/leaderboard";
import { WritingMistake, ChatWordCloudItem } from "../types/studentWork"
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

  static async fetchLeaderboardImage(leaderboard_id: number): Promise<string> {
    const response = await authAxios.get(`original_image/${leaderboard_id}`, {
      responseType: 'arraybuffer',
      headers: sessionStorage.getItem("token")
        ? { Authorization: `Token ${sessionStorage.getItem("token")}` }
        : {},
    });
    
    return `data:image/png;base64,${response.data}`;
  }

  static async fetchLeaderboardAnalysis(leaderboard_id: number, program_name: string, params: LeaderboardAnalysisParams): Promise<LeaderboardAnalysis> {
    const response = await authAxios.get(`analysis/leaderboards/${leaderboard_id}/${program_name}/`, {
      params: params,
      headers: sessionStorage.getItem("token")
        ? { Authorization: `Token ${sessionStorage.getItem("token")}` }
        : {},
    });
    return response.data;
  }

  static async fetchWordCloud(params: WordCloudParams): Promise<(WritingMistake | ChatWordCloudItem)[]> {
    const response = await authAxios.get(`analysis/get_word_cloud_items`, {
      params: params,
      headers: sessionStorage.getItem("token")
        ? { Authorization: `Token ${sessionStorage.getItem("token")}` }
        : {},
    });
    return response.data;
  }
}