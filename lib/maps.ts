const allowedGoogleMapsHosts = new Set([
  "google.com",
  "www.google.com",
  "maps.google.com",
  "maps.app.goo.gl",
  "goo.gl"
]);

export function safeGoogleMapsHref(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !allowedGoogleMapsHosts.has(url.hostname.toLowerCase())) return "";
    return url.toString();
  } catch {
    return "";
  }
}

export function googleMapsEmbedUrl(value: string, location: string) {
  const safe = safeGoogleMapsHref(value);
  if (!safe) return "";
  const url = new URL(safe);
  if ((url.hostname === "google.com" || url.hostname === "www.google.com" || url.hostname === "maps.google.com") && url.pathname.startsWith("/maps/embed")) return safe;
  const query = location.trim();
  return query ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed` : "";
}
