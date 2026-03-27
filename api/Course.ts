import type { BaseListParams } from "../types/leaderboard";
import type { Course } from "../types/user";
import { authAxios } from "./axios";

export class CourseAPI {
  static async fetchCourseList(params: BaseListParams): Promise<Course[]> {
    const response = await authAxios.get("courses/", {
      params: params,
      paramsSerializer: { indexes: null },
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

}