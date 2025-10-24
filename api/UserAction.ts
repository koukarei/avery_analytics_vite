import type { UserActionCreate } from "../types/userAction";
import { authAxios } from "./axios";

export class UserActionAPI {

  static async createUserAction(data: UserActionCreate): Promise<UserActionCreate> {
    const response = await authAxios.post("user_actions/", data, {
      headers: sessionStorage.getItem("access_token")
        ? { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        : {},
    });
    if (response.status !== 201) {
      throw new Error(`Error creating user action: ${response.statusText}`);
    }
    return data;
  }

}