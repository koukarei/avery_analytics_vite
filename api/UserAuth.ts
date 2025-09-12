import { authAxios } from "./axios";
import type {
  SigninData,
  SignupData,
} from "../types/auth";

export class UserAuthAPI {
  static async login(params: SigninData): Promise<{ key: string }> {
    const response = await authAxios.post("token/", params, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
    });
    if (response.status !== 200) {
      throw new Error("Login failed");
    }else{
      return response.data;
    }
  }

  static async signup(data: SignupData): Promise<void> {
    const response = await authAxios.post("users/", data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
    });
    return response.data;
  }

  static async refreshToken(): Promise<{ key: string }> {
    const response = await authAxios.post("refresh_token", {
      headers: sessionStorage.getItem("refresh_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("refresh_token")}` }
        : {},
    });
    if (response.status !== 200) {
      throw new Error("Token refresh failed");
    } else {
      return response.data;
    }
  }
}