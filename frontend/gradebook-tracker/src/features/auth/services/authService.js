import { apiRequest } from "../../../shared/api/httpClient";

export function signupRequest(payload) {
  return apiRequest("/api/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginRequest(payload) {
  return apiRequest("/api/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
