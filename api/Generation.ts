import type { GenerationItem, GenerationItemParams} from "../types/leaderboard";
import type { ChatMessage, GenerationDetail } from "../types/studentWork";
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
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}`, 
        'Content-Type': 'image/png' }
        : {},
    });
    if (response.status !== 200) {
      return "";
    };

    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    return URL.createObjectURL(blob);
  }

  static async fetchGenerationDetail(generation_id: number): Promise<GenerationDetail | null> {
    const response = await authAxios.get(`generation/${generation_id}/`, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });

    return response.data;
  }

  static async fetchGenerationEvaluation(generation_id: number): Promise<ChatMessage | null> {
    const response = await authAxios.get(`evaluation_msg/${generation_id}/`, {
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