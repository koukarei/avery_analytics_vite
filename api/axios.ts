import axios, { type InternalAxiosRequestConfig } from "axios";
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

interface RefreshTokenResponse {
	access_token: string;
}

interface FailedRequest {
	response: {
		config: InternalAxiosRequestConfig;
	};
}

// リフレッシュトークンの取得と設定を行うメソッド
async function refreshAuthLogic(failedRequest: FailedRequest): Promise<void> {
    const refreshToken = sessionStorage.getItem("refresh_token") ?? "";
    
    return authAxios.post<RefreshTokenResponse>(
        `refresh_token/?refresh_token=${refreshToken}`,
        {},
        {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true
        }
    ).then((tokenRefreshResponse) => {
        sessionStorage.setItem('access_token', tokenRefreshResponse.data.access_token);
        failedRequest.response.config.headers['Authorization'] = 
            'Bearer ' + tokenRefreshResponse.data.access_token;
        return Promise.resolve();
    });
}

// interceptorに設定する
createAuthRefreshInterceptor(authAxios, refreshAuthLogic);