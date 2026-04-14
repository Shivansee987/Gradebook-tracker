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

  const response = await fetch(url, {
    headers: normalizedHeaders,
    ...restOptions,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed. Please try again.");
  }

  return data;
}
