import { API_ENDPOINTS } from "../app-constant";
import api from "./api";

// ✅ Create / Update Template
export const saveTemplateService = async (data: {
  name: string;
  title: string;
  subject?: string;
  design?: any;
  html: string;
  property_code?: string;
  property_name?: string;
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

// ✅ Upload an image (logo/banner/thumbnail) to Google Drive, get back a
// publicly viewable link usable directly in template HTML.
export interface ImageCompressionInfo {
  wasCompressed: boolean;
  originalBytes: number;
  finalBytes: number;
  originalWidth: number;
  originalHeight: number;
  width: number;
  height: number;
  quality: number;
  resized: boolean;
}

export const uploadImageService = async (
  file: File
): Promise<{ url: string; fileId: string; viewUrl: string; compression?: ImageCompressionInfo }> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(API_ENDPOINTS.uploadImage, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Image upload failed");
  }
};

// ✅ List images already uploaded to Drive, so the user can reuse one
// instead of uploading a duplicate.
export const listImageGalleryService = async (): Promise<{ fileId: string; name: string; url: string }[]> => {
  try {
    const res = await api.get(API_ENDPOINTS.uploadGallery);

    return res.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to load gallery");
  }
};