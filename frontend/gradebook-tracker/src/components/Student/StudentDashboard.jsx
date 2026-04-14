import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import {
  getActiveGradingVersion,
  getCurrentStudentProfile,
  getCurrentStudentReport,
  getSubjects,
} from "../../pages/services/dashboardService";
import { useToast } from "../../shared/toast/useToast";

function summarizeStudentReport(rows) {
  if (rows.length === 0) {
    return {
      totalSubjects: 0,
      avgExam: "0.00",
      avgAssignment: "0.00",
    };
  }

  const examTotal = rows.reduce(
    (sum, row) => sum + Number(row.exam_marks || 0),
    0,
  );
  const assignmentTotal = rows.reduce(
    (sum, row) => sum + Number(row.assignment_marks || 0),
    0,
  );

  return {
    totalSubjects: rows.length,
    avgExam: (examTotal / rows.length).toFixed(2),
    avgAssignment: (assignmentTotal / rows.length).toFixed(2),
  };
}

export function StudentDashboard() {
  const { token, user, logout } = useAuth();
  const { pushToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [activeVersion, setActiveVersion] = useState(null);
  const [studentRows, setStudentRows] = useState([]);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [studentProfile, setStudentProfile] = useState(null);

  const summary = useMemo(
    () => summarizeStudentReport(studentRows),
    [studentRows],
  );

  const loadStudentDashboard = useCallback(
    async ({ manual = false } = {}) => {
      if (!token) {
        return;
      }

      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setDashboardError("");

      try {
        // Keep student dashboard self-contained by loading version, personal report,
        // and subject catalog in parallel, then enriching rows with readable names.
        const [versionData, reportData, subjectsData, profileData] =
          await Promise.all([
            getActiveGradingVersion({ token }),
            getCurrentStudentReport({ token }),
            getSubjects({ token, page: 1, perPage: 300 }),
            getCurrentStudentProfile({ token }),
          ]);

        const subjects = subjectsData.items || [];
        const nextSubjectsMap = subjects.reduce((acc, subject) => {
          acc[subject.id] = {
            subject_code: subject.subject_code,
            subject_name: subject.subject_name,
          };
          return acc;
        }, {});

        setActiveVersion(versionData || null);
        setSubjectsMap(nextSubjectsMap);
        setStudentRows(Array.isArray(reportData) ? reportData : []);
        setStudentProfile(profileData?.student || null);

        if (manual) {
          pushToast({
            type: "success",
            title: "Student dashboard updated",
            message: "Latest marks report has been loaded.",
          });
        }
      } catch (error) {
        const message = error.message || "Failed to load student dashboard.";
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
    [pushToast, token],
  );

  useEffect(() => {
    loadStudentDashboard();
  }, [loadStudentDashboard]);

  return (
    <main className="dashboard-page">
      <section className="dashboard-card dashboard-card-wide">
        <div className="dashboard-header-row">
          <div>
            <p className="eyebrow">Student Workspace</p>
            <h1>Welcome, {studentProfile?.username || user?.username}</h1>
            <p className="muted-text">
              Track your marks, grades, and active grading policy.
            </p>
          </div>

          <div className="dashboard-actions">
            <button
              className="btn-secondary"
              onClick={() => loadStudentDashboard({ manual: true })}
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
          <p className="muted-text">Loading student dashboard data...</p>
        ) : (
          <>
            {dashboardError && (
              <p className="message message-error">{dashboardError}</p>
            )}

            <section className="dashboard-section">
              <h2>Overview</h2>
              <div className="dashboard-grid">
                <article className="dashboard-tile">
                  <h3>Student Email</h3>
                  <p>{studentProfile?.email || "N/A"}</p>
                </article>
                <article className="dashboard-tile">
                  <h3>Total Subjects</h3>
                  <p>{summary.totalSubjects}</p>
                </article>
                <article className="dashboard-tile">
                  <h3>Average Exam Marks</h3>
                  <p>{summary.avgExam}</p>
                </article>
                <article className="dashboard-tile">
                  <h3>Average Assignment Marks</h3>
                  <p>{summary.avgAssignment}</p>
                </article>
              </div>
            </section>

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
                <p className="muted-text">No active grading version found.</p>
              )}
            </section>

            <section className="dashboard-section">
              <h2>Your Marks Report</h2>
              {studentRows.length === 0 ? (
                <p className="muted-text">No marks are available yet.</p>
              ) : (
                <div className="table-wrap">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Exam</th>
                        <th>Assignment</th>
                        <th>Grade</th>
                        <th>Version ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentRows.map((row, index) => {
                        const subjectMeta = subjectsMap[row.subject_id] || {};
                        return (
                          <tr key={`${row.subject_id}-${index}`}>
                            <td>
                              {subjectMeta.subject_code || row.subject_id}
                            </td>
                            <td>
                              {subjectMeta.subject_name || "Unknown Subject"}
                            </td>
                            <td>{row.exam_marks}</td>
                            <td>{row.assignment_marks}</td>
                            <td>{row.grade ?? "N/A"}</td>
                            <td>{row.grading_version_id ?? "N/A"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}
