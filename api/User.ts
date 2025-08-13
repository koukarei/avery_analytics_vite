import { User } from "../types/studentWork";
import { authAxios } from "./axios";

export class UserAPI {
  static async fetchAuthUser(): Promise<User> {
    const response = await authAxios.get("users/me", {
      headers: sessionStorage.getItem("token")
        ? { Authorization: `Token ${sessionStorage.getItem("token")}` }
        : {},
    });
    return response.data;
  }
}