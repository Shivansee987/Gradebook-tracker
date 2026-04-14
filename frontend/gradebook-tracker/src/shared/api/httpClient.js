function buildApiUrl(path) {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();

  // Keep absolute URLs untouched.
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // For production deployments (e.g., Vercel -> Render), service files still call
  // /api/* paths from local proxy days, so normalize them to backend routes.
  const normalizedPath =
    baseUrl && path.startsWith("/api/") ? path.replace(/^\/api/, "") : path;

  if (!baseUrl) {
    return normalizedPath;
  }

  return `${baseUrl.replace(/\/$/, "")}${normalizedPath}`;
}

export async function apiRequest(url, options = {}) {
  const { authToken, headers: customHeaders, ...restOptions } = options;

  const normalizedHeaders = {
    "Content-Type": "application/json",
    ...(customHeaders || {}),
  };

  // Attach JWT only when caller asks for authenticated requests.
  if (authToken) {
    normalizedHeaders.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(buildApiUrl(url), {
    headers: normalizedHeaders,
    ...restOptions,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed. Please try again.");
  }

  return data;
}
