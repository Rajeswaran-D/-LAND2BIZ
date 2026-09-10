// Central re-export: the real client lives in lib/apiClient.ts (typed Confidence included).
// This file previously contained a broken fetch (string literal instead of template) — deleted.
export { apiClient } from "@/lib/apiClient";
export type { Confidence } from "@/lib/apiClient";
