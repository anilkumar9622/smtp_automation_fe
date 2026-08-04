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

// `value` stays "customer"/"agent" — it drives the template's internal name
// (e.g. "tlpj_for_customer") and the backend's routing logic
// (buildTemplateName in the backend's propertyCodes.ts), both keyed off
// this exact string. Only `label` is the display text shown in the UI, so
// it can be renamed freely without touching naming/lookup behavior.
export const PROPERTY_VARIANTS = [
  { value: "customer", label: "Guest" },
  { value: "agent", label: "Travel agent" },
] as const;
