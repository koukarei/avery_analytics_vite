import { authAxios } from "./axios";
import type {
  SigninData,
  SignupData,
} from "../types/auth";

export class UserAuthAPI {
  static async login(params: SigninData): Promise<{ key: string }> {
    const response = await authAxios.post("token/", params, {
      headers: sessionStorage.getItem("token")
        ? { Authorization: `Token ${sessionStorage.getItem("token")}` }
        : {},
    });
    return response.data;
  }

  static async signup(data: SignupData): Promise<void> {
    await authAxios.post("dj-rest-auth/registration/", data, {
      headers: sessionStorage.getItem("token")
        ? { Authorization: `Token ${sessionStorage.getItem("token")}` }
        : {},
    });
  }
}