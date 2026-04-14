import { apiRequest } from "../../shared/api/httpClient";

// Pull the active grading weights/version for all authenticated roles.
export function getActiveGradingVersion({ token }) {
  return apiRequest("/api/version/active", {
    method: "GET",
    authToken: token,
  });
}

// Student report endpoint returns the current user's historical marks rows.
export function getStudentReport({ token, studentId }) {
  return apiRequest(`/api/report/student/${studentId}`, {
    method: "GET",
    authToken: token,
  });
}

// Teacher/admin endpoint returns paginated marks across students.
export function getAllMarksReport({ token, page = 1, perPage = 100 }) {
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  return apiRequest(`/api/report/teacher/all-marks?${query.toString()}`, {
    method: "GET",
    authToken: token,
  });
}
