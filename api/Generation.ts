import { GenerationItem, GenerationItemParams} from "../types/leaderboard";
import { authAxios } from "./axios";

export class GenerationItemAPI {
  static async fetchGenerationItemList(params: GenerationItemParams): Promise<GenerationItem[]> {
    const response = await authAxios.get("Generations/", {
      params: params,
      paramsSerializer: { indexes: null },
      headers: sessionStorage.getItem("token")
        ? { Authorization: `Token ${sessionStorage.getItem("token")}` }
        : {},
    });
    return response.data;
  }

  static async fetchGenerationImage(id: number): Promise<string> {
    const response = await authAxios.get(`Generations/${id}/image/`, {
      responseType: 'arraybuffer',
      headers: sessionStorage.getItem("token")
        ? { Authorization: `Token ${sessionStorage.getItem("token")}` }
        : {},
    });
    
    return `data:image/png;base64,${response.data}`;
  }
}