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
      // loop for saving token in sessionStorage
      for (const [key, value] of Object.entries(response.data)) {
        sessionStorage.setItem(key, String(value));
      }
      return { key: response.data.key };
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
}