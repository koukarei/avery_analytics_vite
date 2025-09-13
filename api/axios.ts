import axios from "axios";
import createAuthRefreshInterceptor from 'axios-auth-refresh';

export const authAxios = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

export const authAxiosMultipart = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
	headers: {
		"Content-Type": "multipart/form-data",
	},
});

// リフレッシュトークンの取得と設定を行うメソッド
async function refreshAuthLogic(failedRequest: any) {
    return authAxios.post("refresh_token/?refresh_token=" + (sessionStorage.getItem("refresh_token") ? sessionStorage.getItem("refresh_token") : ""), {
    }, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true
    }).then((tokenRefreshResponse) => {
        sessionStorage.setItem('access_token', tokenRefreshResponse.data.access_token);
        failedRequest.response.config.headers['Authorization'] = 'Bearer ' + tokenRefreshResponse.data.access_token;
        return Promise.resolve();
    });
}

// interceptorに設定する
createAuthRefreshInterceptor(authAxios, refreshAuthLogic);

