export function hasAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const allowedOrigins = new Set([requestUrl.origin]);
    if (forwardedHost && forwardedProtocol) allowedOrigins.add(`${forwardedProtocol}://${forwardedHost}`);
    return allowedOrigins.has(originUrl.origin);
  } catch {
    return false;
  }
}

export function isJsonRequest(request: Request) {
  return request.headers.get("content-type")?.toLowerCase().startsWith("application/json") ?? false;
}
