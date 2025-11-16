import type { User, UsersStats, UserListParams, UserUpdate, UserPasswordUpdate } from "../types/user";
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

  static async fetchUsersStats(): Promise<UsersStats> {
    const response = await authAxios.get("users/stats", {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

  static async fetchUsersList(params: UserListParams): Promise<User[]> {
    const response = await authAxios.get("users/", {
      params: {
        skip: params.skip ? params.skip : 0,
        limit: params.limit ? params.limit : 10,
      },
      paramsSerializer: { indexes: null },
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }
  
  static async updateUser(data: Partial<UserUpdate>): Promise<User | null> {
    if (!data.id && !data.username && !data.email) {
      return null;
    }
    const response = await authAxios.put(`users/${data.id ? data.id : "0"}`, data, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }
  
  static async updatePassword(data: Partial<UserPasswordUpdate>): Promise<User | null> {
    if (!data.id && !data.old_password && !data.new_password) return null;
    const response = await authAxios.put(`users/${data.id}/password`, data, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    return response.data;
  }

}