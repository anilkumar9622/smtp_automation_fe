import { useEffect, useState } from "react";
import { listPropertyOptionsService, type PropertyOption } from "../services/propertyServices";

// Shared, fetched-once list of properties for dropdowns. Properties are
// managed from the Property Management page, so this replaces the old
// hard-coded list. Call refreshPropertyOptions() after a property change.
let cache: PropertyOption[] | null = null;
let inflight: Promise<PropertyOption[]> | null = null;
const listeners = new Set<(options: PropertyOption[]) => void>();

export const refreshPropertyOptions = (): Promise<PropertyOption[]> => {
  if (!inflight) {
    inflight = listPropertyOptionsService()
      .then((options) => {
        cache = options;
        listeners.forEach((fn) => fn(options));
        return options;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
};

export default function usePropertyOptions() {
  const [options, setOptions] = useState<PropertyOption[]>(cache ?? []);

  useEffect(() => {
    listeners.add(setOptions);
    if (!cache) refreshPropertyOptions().catch((err) => console.error("Failed to load properties:", err));
    return () => {
      listeners.delete(setOptions);
    };
  }, []);

  const nameOf = (code?: string | null) => options.find((p) => p.code === code)?.name ?? code ?? "";

  // Disabled properties stay in the list (so existing rows still resolve a
  // name) but can't be newly picked.
  const selectOptions = options.map((p) => ({
    value: p.code,
    label: `${p.name} (${p.code})${p.is_active ? "" : " — disabled"}`,
    disabled: !p.is_active,
  }));

  return { options, nameOf, selectOptions };
}
