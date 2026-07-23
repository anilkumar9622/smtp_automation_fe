import { API_ENDPOINTS } from "../app-constant";
import api from "./api";

// ✅ Create / Update Template
export const saveTemplateService = async (data: {
  name: string;
  title: string;
  subject?: string;
  design?: any;
  html: string;
}) => {
  try {
    const res = await api.post(API_ENDPOINTS.emailTemplate, data);

    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to save template");
  }
};

// ✅ Get All Templates (Dropdown)
export const getAllTemplatesService = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.emailTemplate);

    return res.data.data;
  } catch (error: any) {
    throw new Error("Failed to fetch templates");
  }
};

// ✅ Get Template By Name
export const getTemplateByNameService = async (name: string) => {
  try {
    const res = await api.get(`${API_ENDPOINTS.emailTemplate}/${name}`);

    return res.data.data;
  } catch (error: any) {
    throw new Error("Template not found");
  }
};

// ❌ Optional: Delete Template
export const deleteTemplateService = async (name: string) => {
  try {
    const res = await api.delete(`${API_ENDPOINTS.emailTemplate}/${name}`);

    return res.data;
  } catch (error: any) {
    throw new Error("Failed to delete template");
  }
};