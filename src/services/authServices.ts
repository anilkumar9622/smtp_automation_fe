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

    const allowedRoles = ["SUPER_ADMIN", "ADMIN", "PROPERTY_OPERATOR"];
    if (!allowedRoles.includes(user.role)) {
        throw new Error("Access denied.");
    }

    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));

    return res;
};

export interface ChangePasswordPayload {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const changePasswordService = async (payload: ChangePasswordPayload) => {
  const res = await api.post(API_ENDPOINTS.changePassword, payload);
  return res;
};
