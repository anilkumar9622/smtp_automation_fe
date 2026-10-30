// The property list itself is managed from the Property Management page
// and loaded with hooks/usePropertyOptions.ts.

// `value` stays "customer"/"agent" — it drives the template's internal name
// (e.g. "tlpj_for_customer") and the backend's routing logic
// (buildTemplateName in the backend's propertyCodes.ts), both keyed off
// this exact string. Only `label` is the display text shown in the UI, so
// it can be renamed freely without touching naming/lookup behavior.
export const PROPERTY_VARIANTS = [
  { value: "customer", label: "Guest" },
  { value: "agent", label: "Travel agent" },
] as const;
