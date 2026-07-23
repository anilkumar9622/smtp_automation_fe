import { API_ENDPOINTS } from "../app-constant";
import api from "./api";
// import { API_ENDPOINTS } from "../constants/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  
  data:{user: {
    email: string;
    role: string;
  };
  accessToken: string
}
}

export const loginService = async (payload: LoginPayload) => {
    const res = await api.post<LoginResponse>(
        API_ENDPOINTS.login,
        payload // <-- not { data: payload }
    );

    const { accessToken, user } = res.data.data;

    if (user.role !== "ADMIN") {
        throw new Error("Access denied. Only admin allowed.");
    }

    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));

    return res;
};