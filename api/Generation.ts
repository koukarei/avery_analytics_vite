import { GenerationItem, GenerationItemParams} from "../types/leaderboard";
import { authAxios } from "./axios";

export class GenerationItemAPI {
  static async fetchGenerationItemList(params: GenerationItemParams): Promise<GenerationItem[]> {
    const response = await authAxios.get("analysis/generations", {
      params: params,
      paramsSerializer: { indexes: null },
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async fetchGenerationImage(generation_id: number): Promise<string> {
    const response = await authAxios.get(`interpreted_image/${generation_id}`, {
      responseType: 'arraybuffer',
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    
    return `data:image/png;base64,${response.data}`;
  }
}