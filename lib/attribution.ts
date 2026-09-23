export type RequestAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  landingPage?: string;
};

export function readSessionAttribution(): RequestAttribution | undefined {
  try {
    const value = JSON.parse(sessionStorage.getItem("irp_utm_v1") || "{}") as Record<string, unknown>;
    const text = (key: string, legacy?: string) => {
      const candidate = value[key] ?? (legacy ? value[legacy] : undefined);
      return typeof candidate === "string" && candidate.trim() ? candidate.trim() : undefined;
    };
    const attribution: RequestAttribution = {
      source: text("source", "utm_source"),
      medium: text("medium", "utm_medium"),
      campaign: text("campaign", "utm_campaign"),
      content: text("content", "utm_content"),
      term: text("term", "utm_term"),
      landingPage: text("landingPage")
    };
    return Object.values(attribution).some(Boolean) ? attribution : undefined;
  } catch {
    return undefined;
  }
}
