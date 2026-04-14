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

// Teachers/admin can activate a new grading version.
export function createGradingVersion({ token, payload }) {
  return apiRequest("/api/version", {
    method: "POST",
    authToken: token,
    body: JSON.stringify(payload),
  });
}

// Teachers/admin can add marks for a student and subject.
export function createMarks({ token, payload }) {
  return apiRequest("/api/add-marks", {
    method: "POST",
    authToken: token,
    body: JSON.stringify(payload),
  });
}

// Teachers/admin can fetch registered students from users table where role=student.
export function getRegisteredStudents({ token, page = 1, perPage = 50 }) {
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  return apiRequest(`/api/students/registered?${query.toString()}`, {
    method: "GET",
    authToken: token,
  });
}
