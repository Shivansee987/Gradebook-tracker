// JWT helper utilities are kept framework-agnostic so both context and services can reuse them.

function decodeBase64Url(base64UrlValue) {
  const base64 = base64UrlValue.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return atob(padded);
}

export function decodeTokenPayload(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const tokenParts = token.split(".");
  if (tokenParts.length < 2) {
    return null;
  }

  try {
    const payloadJson = decodeBase64Url(tokenParts[1]);
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

export function getTokenExpiryMs(token) {
  const payload = decodeTokenPayload(token);
  if (!payload || typeof payload.exp !== "number") {
    return null;
  }

  // exp is in seconds since epoch per JWT spec; convert to milliseconds for JS timers.
  return payload.exp * 1000;
}

export function isTokenExpired(token) {
  const expiryMs = getTokenExpiryMs(token);
  if (!expiryMs) {
    return true;
  }

  return Date.now() >= expiryMs;
}
