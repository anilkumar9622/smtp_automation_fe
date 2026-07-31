// Mirrors the backend's PropertyCode enum (smtp_20_07_2026/src/core/emailTemplate/propertyCodes.ts).
export const PROPERTY_OPTIONS = [
  { code: "TLASH", name: "The Leela Ashtamudi, A Raviz Hotel" },
  { code: "TLBCB", name: "The Leela Bhartiya City Bengaluru" },
  { code: "TLGN", name: "The Leela Gandhinagar" },
  { code: "TLH", name: "The Leela Hyderabad" },
  { code: "TLKOV", name: "The Leela Kovalam, A Raviz Hotel" },
  { code: "TLM", name: "The Leela Mumbai" },
  { code: "TLPB", name: "The Leela Palace Bengaluru" },
  { code: "TLPC", name: "The Leela Palace Chennai" },
  { code: "TLPJ", name: "The Leela Palace Jaipur" },
  { code: "TLPND", name: "The Leela Palace New Delhi" },
  { code: "TLPU", name: "The Leela Palace Udaipur" },
] as const;

export const PROPERTY_VARIANTS = [
  { value: "customer", label: "Customer" },
  { value: "agent", label: "Agent" },
] as const;
