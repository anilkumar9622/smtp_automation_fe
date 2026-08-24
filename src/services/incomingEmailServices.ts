import { API_ENDPOINTS } from "../app-constant";
import api from "./api";

export interface IncomingEmailRow {
  id: number;
  sender: string;
  recipient: string;
  subject: string | null;
  reservation_number: string | null;
  guest_name: string | null;
  check_in: string | null;
  check_out: string | null;
  raw_data: any;
  email_sent_status: string | null;
  error_remarks: string | null;
  property_code: string | null;
  property_name: string | null;
  created_at: string;
}

export interface ListIncomingEmailsParams {
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ListIncomingEmailsResult {
  data: IncomingEmailRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

// ✅ List sent-email log rows for the Email Details page — paginated,
// optionally filtered by created_at date range, and optionally searched
// across sender/recipient/reservation number/guest name.
export const listIncomingEmailsService = async (params: ListIncomingEmailsParams): Promise<ListIncomingEmailsResult> => {
  try {
    const res = await api.get(API_ENDPOINTS.incomingEmail, { params });
    return { data: res.data.data, pagination: res.data.pagination };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch incoming emails");
  }
};
