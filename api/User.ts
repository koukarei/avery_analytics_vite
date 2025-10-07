import type { User } from "../types/user";
import { authAxios } from "./axios";

export class UserAPI {
  static async fetchAuthUser(): Promise<User> {
    const response = await authAxios.get("users/me", {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }
}