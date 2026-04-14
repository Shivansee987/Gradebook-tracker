import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../features/auth/hooks/useAuth";
import {
  getActiveGradingVersion,
  getAuditLogs,
  getAllMarksReport,
  getStudentReport,
} from "./services/dashboardService";
import { useToast } from "../shared/toast/useToast";

function summarizeSubjects(rows) {
  const bucket = new Map();

  // Build aggregated metrics per subject so the dashboard can show a concise overview.
  rows.forEach((row) => {
    const subjectId = row.subject_id || "unknown";

    if (!bucket.has(subjectId)) {
      bucket.set(subjectId, {
        subjectId,
        entries: 0,
        examTotal: 0,
        assignmentTotal: 0,
      });
    }

    const subject = bucket.get(subjectId);
    subject.entries += 1;
    subject.examTotal += Number(row.exam_marks || 0);
    subject.assignmentTotal += Number(row.assignment_marks || 0);
  });

  return Array.from(bucket.values())
    .map((subject) => ({
      ...subject,
      avgExam: (subject.examTotal / subject.entries).toFixed(2),
      avgAssignment: (subject.assignmentTotal / subject.entries).toFixed(2),
    }))
    .sort((a, b) => String(a.subjectId).localeCompare(String(b.subjectId)));
}

export function DashboardPage() {
  const { user, token, logout } = useAuth();
  const { pushToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [activeVersion, setActiveVersion] = useState(null);
  const [studentRows, setStudentRows] = useState([]);
  const [teacherRows, setTeacherRows] = useState([]);
  const [teacherPagination, setTeacherPagination] = useState(null);
  const [auditRows, setAuditRows] = useState([]);
  const [auditPagination, setAuditPagination] = useState(null);

  const isElevatedRole = user?.role === "admin";

  const primaryRows = useMemo(
    () => (isElevatedRole ? teacherRows : studentRows),
    [isElevatedRole, teacherRows, studentRows],
  );

  const subjectSummary = useMemo(
    () => summarizeSubjects(primaryRows),
    [primaryRows],
  );

  const loadDashboardData = useCallback(
    async ({ isManualRefresh = false } = {}) => {
      if (!token) {
        return;
      }

      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setDashboardError("");

      try {
        const versionPromise = getActiveGradingVersion({ token });

        if (isElevatedRole) {
          // Admin dashboard merges operational data and recent audit trail
          // so supervisors can verify *what changed* and *who changed it*.
          const [versionData, allMarksData, auditData] = await Promise.all([
            versionPromise,
            getAllMarksReport({ token, page: 1, perPage: 100 }),
            getAuditLogs({ token, page: 1, perPage: 25 }),
          ]);

          setActiveVersion(versionData);
          setTeacherRows(allMarksData.items || []);
          setTeacherPagination(allMarksData.pagination || null);
          setAuditRows(auditData.items || []);
          setAuditPagination(auditData.pagination || null);
          setStudentRows([]);
        } else {
          const [versionData, studentReportData] = await Promise.all([
            versionPromise,
            getStudentReport({ token, studentId: user.unique_id }),
          ]);

          setActiveVersion(versionData);
          setStudentRows(
            Array.isArray(studentReportData) ? studentReportData : [],
          );
          setTeacherRows([]);
          setTeacherPagination(null);
          setAuditRows([]);
          setAuditPagination(null);
        }

        if (isManualRefresh) {
          pushToast({
            type: "success",
            title: "Dashboard updated",
            message: "Latest subjects, marks, and report data has been loaded.",
          });
        }
      } catch (error) {
        const message = error.message || "Failed to load dashboard data.";
        setDashboardError(message);
        pushToast({
          type: "error",
          title: "Dashboard error",
          message,
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isElevatedRole, pushToast, token, user?.unique_id],
  );

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <main className="dashboard-page">
      <section className="dashboard-card dashboard-card-wide">
        <div className="dashboard-header-row">
          <div>
            <p className="eyebrow">Gradebook Tracker</p>
            <h1>Welcome, {user?.username}</h1>
            <p className="muted-text">
              Role: <strong>{user?.role}</strong> | Email:{" "}
              <strong>{user?.email}</strong>
            </p>
          </div>

          <div className="dashboard-actions">
            <button
              className="btn-secondary"
              onClick={() => loadDashboardData({ isManualRefresh: true })}
              type="button"
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button className="btn-secondary" onClick={logout} type="button">
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <p className="muted-text">Loading dashboard data...</p>
        ) : (
          <>
            {dashboardError && (
              <p className="message message-error">{dashboardError}</p>
            )}

            <section className="dashboard-section">
              <h2>Active Grading Version</h2>
              {activeVersion ? (
                <div className="dashboard-grid">
                  <article className="dashboard-tile">
                    <h3>Version ID</h3>
                    <p>{activeVersion.id || "N/A"}</p>
                  </article>
                  <article className="dashboard-tile">
                    <h3>Exam Weight</h3>
                    <p>{activeVersion.exam_weight ?? "N/A"}</p>
                  </article>
                  <article className="dashboard-tile">
                    <h3>Assignment Weight</h3>
                    <p>{activeVersion.assignment_weight ?? "N/A"}</p>
                  </article>
                </div>
              ) : (
                <p className="muted-text">
                  No active grading version returned by API.
                </p>
              )}
            </section>

            <section className="dashboard-section">
              <h2>Subjects Summary</h2>
              {subjectSummary.length === 0 ? (
                <p className="muted-text">No subject data available yet.</p>
              ) : (
                <div className="table-wrap">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Subject ID</th>
                        <th>Entries</th>
                        <th>Avg Exam</th>
                        <th>Avg Assignment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectSummary.map((subject) => (
                        <tr key={subject.subjectId}>
                          <td>{subject.subjectId}</td>
                          <td>{subject.entries}</td>
                          <td>{subject.avgExam}</td>
                          <td>{subject.avgAssignment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="dashboard-section">
              <h2>
                {isElevatedRole ? "All Marks Report" : "Your Marks Report"}
              </h2>

              {primaryRows.length === 0 ? (
                <p className="muted-text">No marks/report rows available.</p>
              ) : (
                <div className="table-wrap">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        {isElevatedRole && <th>Student ID</th>}
                        <th>Subject ID</th>
                        <th>Exam</th>
                        <th>Assignment</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {primaryRows.map((row, index) => (
                        <tr
                          key={`${row.student_id || user?.unique_id}-${row.subject_id}-${index}`}
                        >
                          {isElevatedRole && <td>{row.student_id}</td>}
                          <td>{row.subject_id}</td>
                          <td>{row.exam_marks}</td>
                          <td>{row.assignment_marks}</td>
                          <td>{row.grade ?? "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {isElevatedRole && teacherPagination && (
                <p className="muted-text dashboard-pagination-note">
                  Showing page {teacherPagination.page} of{" "}
                  {teacherPagination.pages} | total records:{" "}
                  {teacherPagination.total}
                </p>
              )}
            </section>

            {isElevatedRole && (
              <section className="dashboard-section">
                <h2>Audit Activity</h2>
                <p className="muted-text">
                  This timeline shows backend write operations such as subject
                  create/update/delete, grading version changes, and marks
                  inserts.
                </p>

                {auditRows.length === 0 ? (
                  <p className="muted-text">No audit entries yet.</p>
                ) : (
                  <div className="table-wrap">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>When</th>
                          <th>Action</th>
                          <th>Table</th>
                          <th>Record ID</th>
                          <th>Changed By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditRows.map((row) => (
                          <tr key={row.id}>
                            <td>
                              {row.timestamp
                                ? new Date(row.timestamp).toLocaleString()
                                : "N/A"}
                            </td>
                            <td>{row.action_type}</td>
                            <td>{row.table_name}</td>
                            <td>{row.record_id}</td>
                            <td>{row.changed_by}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {auditPagination && (
                  <p className="muted-text dashboard-pagination-note">
                    Showing page {auditPagination.page} of{" "}
                    {auditPagination.pages} | total audit rows:{" "}
                    {auditPagination.total}
                  </p>
                )}
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}
