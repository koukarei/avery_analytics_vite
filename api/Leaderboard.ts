import type { 
  Leaderboard, 
  LeaderboardItem, 
  School, 
  LeaderboardAnalysis, 
  LeaderboardListParams, 
  LeaderboardFetchParams,
  LeaderboardAnalysisParams, 
  WordCloudParams, 
  LeaderboardUpdate, 
  LeaderboardCreateAPI,
  LeaderboardSchoolUpdate,
  LeaderboardStartNew,
  Stats
} from "../types/leaderboard";
import type { WritingMistake, ChatWordCloudItem, Round } from "../types/studentWork"
import { authAxios } from "./axios";

export class LeaderboardAPI {
  static async fetchLeaderboardStats(params: LeaderboardListParams): Promise<Stats> {
    const response = await authAxios.get("leaderboards/stats", {
      params: {
        published_at_start: params.published_at_start ? params.published_at_start.format('DDMMYYYY') : null,
        published_at_end: params.published_at_end ? params.published_at_end.format('DDMMYYYY') : null,
        is_public: params.is_public !== undefined ? params.is_public : true,
      },
      paramsSerializer: { indexes: null },
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }
  
  static async fetchLeaderboardStatsAdmin(params: LeaderboardListParams): Promise<Stats> {
    const response = await authAxios.get("leaderboards/admin/stats", {
      params: {
        published_at_start: params.published_at_start ? params.published_at_start.format('DDMMYYYY') : null,
        published_at_end: params.published_at_end ? params.published_at_end.format('DDMMYYYY') : null,
        is_public: params.is_public !== undefined ? params.is_public : true,
      },
      paramsSerializer: { indexes: null },
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }
  static async fetchLeaderboardList(params: LeaderboardFetchParams): Promise<[Leaderboard, School][]> {
    const response = await authAxios.get("leaderboards/", {
      params: {
        skip: params.skip ? params.skip : 0,
        limit: params.limit ? params.limit : 10,
        published_at_start: params.published_at_start ? params.published_at_start.format('DDMMYYYY') : null,
        published_at_end: params.published_at_end ? params.published_at_end.format('DDMMYYYY') : null,
        is_public: params.is_public !== undefined ? params.is_public : true,
      },
      paramsSerializer: { indexes: null },
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }
  
  static async fetchLeaderboardListAdmin(params: LeaderboardFetchParams): Promise<Leaderboard[]> {
    const response = await authAxios.get("leaderboards/admin/", {
      params: {
        skip: params.skip ? params.skip : 0,
        limit: params.limit ? params.limit : 10,
        published_at_start: params.published_at_start ? params.published_at_start.format('DDMMYYYY') : null,
        published_at_end: params.published_at_end ? params.published_at_end.format('DDMMYYYY') : null,
        is_public: params.is_public !== undefined ? params.is_public : true,
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

  static async fetchLeaderboardStartNew(leaderboard_id: number, program: string): Promise<LeaderboardStartNew> {

    const response = await authAxios.get(`leaderboards/${leaderboard_id}/check_ok_to_start_new?program=${program}/`, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
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

  static async fetchLeaderboardRounds(leaderboard_id: number, params: { program: string }): Promise<Round[]> {
    const response = await authAxios.get(`leaderboards/${leaderboard_id}/rounds/`, {
      params: params,
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    if (response.status !== 200){
      throw new Error(`Error fetching leaderboard rounds: ${response} `);
    }
    
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
      data.published_at = (typeof data.published_at === 'string') ? data.published_at : `${data.published_at.toISOString().split('T')[0]}T00:00:00Z`;
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
    data.published_at = (typeof data.published_at === 'string') ? data.published_at : `${data.published_at.toISOString().split('T')[0]}T00:00:00Z`;
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