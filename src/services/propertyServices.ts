import { API_ENDPOINTS } from "../app-constant";
import api from "./api";

export interface ManagedProperty {
  property_code: string;
  property_name: string;
  expiry_date: string | null;
  is_expired: boolean;
  updated_by_email: string | null;
  updated_at: string | null;
}

const errorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback;

export const listPropertiesService = async (): Promise<ManagedProperty[]> => {
  try {
    const res = await api.get(API_ENDPOINTS.propertyList);
    return res.data.data;
  } catch (error: any) {
    throw new Error(errorMessage(error, "Failed to fetch properties"));
  }
};

// `expiryDate` null removes the expiry (property never expires).
export const setPropertyExpiryService = async (propertyCode: string, expiryDate: string | null): Promise<string> => {
  try {
    const res = await api.put(API_ENDPOINTS.propertyExpiry(propertyCode), { expiry_date: expiryDate });
    return res.data.message;
  } catch (error: any) {
    throw new Error(errorMessage(error, "Failed to update expiry"));
  }
};

// No `propertyCodes` (or an empty list) applies to every property.
export const setBulkPropertyExpiryService = async (expiryDate: string | null, propertyCodes?: string[]): Promise<string> => {
  try {
    const res = await api.put(API_ENDPOINTS.propertyExpiryBulk, { expiry_date: expiryDate, property_codes: propertyCodes });
    return res.data.message;
  } catch (error: any) {
    throw new Error(errorMessage(error, "Failed to update expiry"));
  }
};
