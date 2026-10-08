import { API_ENDPOINTS } from "../app-constant";
import api from "./api";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "PROPERTY_OPERATOR";

export interface ManagedUser {
  userId: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  property_code: string | null;
  emailVerified: boolean;
  isDeleted: boolean;
  passwordChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormPayload {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  property_code?: string | null;
}

export interface CreateUserPayload extends UserFormPayload {
  password: string;
}

const errorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback;

export const listUsersService = async (): Promise<ManagedUser[]> => {
  try {
    const res = await api.get(API_ENDPOINTS.userList);
    return res.data.data;
  } catch (error: any) {
    throw new Error(errorMessage(error, "Failed to fetch users"));
  }
};

export const createUserService = async (payload: CreateUserPayload): Promise<string> => {
  try {
    const res = await api.post(API_ENDPOINTS.userCreate, payload);
    return res.data.message;
  } catch (error: any) {
    throw new Error(errorMessage(error, "Failed to create user"));
  }
};

export const updateUserService = async (userId: number, payload: UserFormPayload): Promise<string> => {
  try {
    const res = await api.put(API_ENDPOINTS.userUpdate(userId), payload);
    return res.data.message;
  } catch (error: any) {
    throw new Error(errorMessage(error, "Failed to update user"));
  }
};

export const resetUserPasswordService = async (userId: number, password: string): Promise<string> => {
  try {
    const res = await api.put(API_ENDPOINTS.userResetPassword(userId), { password });
    return res.data.message;
  } catch (error: any) {
    throw new Error(errorMessage(error, "Failed to reset password"));
  }
};

export const updateUserStatusService = async (userId: number, isActive: boolean): Promise<string> => {
  try {
    const res = await api.put(API_ENDPOINTS.userStatus(userId), { isActive });
    return res.data.message;
  } catch (error: any) {
    throw new Error(errorMessage(error, "Failed to update user status"));
  }
};
