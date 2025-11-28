import type { StoryCreate, Story, BaseListParams } from "../types/leaderboard";
import { authAxios } from "./axios";

export class StoryAPI {
  static async fetchStoryList(params: BaseListParams): Promise<Story[]> {
    const response = await authAxios.get("stories/", {
      params: params,
      paramsSerializer: { indexes: null },
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async createStory(data: StoryCreate): Promise<Story> {
    const response = await authAxios.post("story/", data, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` ,
            'Content-Type': 'multipart/form-data'}
        : {},
    });
    
    return response.data;
  }

}