import type { Scene, BaseListParams } from "../types/leaderboard";
import { authAxios } from "./axios";

export class SceneAPI {
  static async fetchSceneList(params: BaseListParams): Promise<Scene[]> {
    const response = await authAxios.get("scenes/", {
      params: params,
      paramsSerializer: { indexes: null },
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async createScene(data: { name: string; prompt: string }): Promise<Scene> {
    const response = await authAxios.post("scenes/", data, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

}