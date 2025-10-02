import type { 
  Leaderboard, 
  LeaderboardItem, 
  School, 
  LeaderboardAnalysis, 
  LeaderboardListParams, 
  LeaderboardAnalysisParams, 
  WordCloudParams, 
  LeaderboardUpdate, 
  LeaderboardCreateAPI,
  LeaderboardSchoolUpdate
} from "../types/leaderboard";
import type { WritingMistake, ChatWordCloudItem } from "../types/studentWork"
import { authAxios } from "./axios";

export class LeaderboardAPI {
  static async fetchLeaderboardList(params: LeaderboardListParams): Promise<[Leaderboard, School][]> {
    const response = await authAxios.get("leaderboards/", {
      params: {
        skip: params.skip ? params.skip : 0,
        limit: params.limit ? params.limit : 10,
        published_at_start: params.published_at_start ? params.published_at_start.format('DDMMYYYY') : null,
        published_at_end: params.published_at_end ? params.published_at_end.format('DDMMYYYY') : null,
      },
      paramsSerializer: { indexes: null },
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }
  
  static async fetchLeaderboardListAdmin(params: LeaderboardListParams): Promise<Leaderboard[]> {
    const response = await authAxios.get("leaderboards/admin/", {
      params: {
        skip: params.skip ? params.skip : 0,
        limit: params.limit ? params.limit : 10,
        published_at_start: params.published_at_start ? params.published_at_start.format('DDMMYYYY') : null,
        published_at_end: params.published_at_end ? params.published_at_end.format('DDMMYYYY') : null,
      },
      paramsSerializer: { indexes: null },
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async fetchLeaderboardDetail(id: number): Promise<LeaderboardItem | null> {
    const response = await authAxios.get(`leaderboards/${id}/`, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async fetchLeaderboardImage(leaderboard_id: number): Promise<string> {
    const response = await authAxios.get(`original_image/${leaderboard_id}`, {
      responseType: 'arraybuffer',
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}`, 
          'Content-Type': 'image/png' }
        : {},
    });
    
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    return URL.createObjectURL(blob);
  }

  static async fetchLeaderboardAnalysis(leaderboard_id: number, program_name: string, params: LeaderboardAnalysisParams): Promise<LeaderboardAnalysis> {
    
    const response = await authAxios.get(`analysis/leaderboards/${leaderboard_id}/${program_name}/`, {
      params: params,
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async fetchWordCloud(params: WordCloudParams): Promise<(WritingMistake | ChatWordCloudItem)[]> {
    const response = await authAxios.get(`analysis/get_word_cloud_items`, {
      params: params,
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async fetchLeaderboardSchools(id: number): Promise<School[]> {
    const response = await authAxios.get(`leaderboards/${id}/schools/`, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async addLeaderboardSchools(id: number, data: Partial<LeaderboardSchoolUpdate>): Promise<School[]> {
    const response = await authAxios.put(`leaderboards/${id}/school/`, data, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    if (response.status !== 200){
      throw new Error(`Error updating leaderboard schools: ${response} `);
    }

    return response.data;
  }

  static async deleteLeaderboardSchool(leaderboard_id: number, school: string): Promise<School[]> {
    const response = await authAxios.delete(`leaderboards/${leaderboard_id}/school/`, {
      params: {
        school: school
      },
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async updateLeaderboard(id: number, data: Partial<LeaderboardUpdate>): Promise<LeaderboardUpdate | null> {
    // remove time from published_at if it exists
    if (data.published_at) {
      data.published_at = (typeof data.published_at === 'string') ? data.published_at : data.published_at.toISOString().split('T')[0];
    }
    const response = await authAxios.put(`leaderboards/${id}/`, data, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async createLeaderboardImage(
    imageFile: File
  ){
    const formData = new FormData();
    formData.append('original_image', imageFile);

    const response = await authAxios.post(`leaderboards/image`, formData, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
            'Content-Type': 'multipart/form-data'}
        : {},
    });
    if (response.status !== 201){
      throw new Error(`Error uploading image: ${response}`);
    }
    return response.data;
  }

  static async createLeaderboard(data: LeaderboardCreateAPI): Promise<LeaderboardCreateAPI | null> {
    // remove time from published_at
    data.published_at = (typeof data.published_at === 'string') ? data.published_at : data.published_at.toISOString().split('T')[0];
    const response = await authAxios.post(`leaderboards/`, data, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    if (response.status !== 200 && response.status !== 201){
      throw new Error(`Error creating leaderboard: ${response} `);
    }
    return response.data;
  }
}