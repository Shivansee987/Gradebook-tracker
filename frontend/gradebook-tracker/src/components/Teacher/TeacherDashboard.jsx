import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useToast } from "../../shared/toast/useToast";
import {
  createGradingVersion,
  createMarks,
  getActiveGradingVersion,
  getAllMarksReport,
  getRegisteredStudents,
  getStudentReport,
} from "../../pages/services/dashboardService";

function summarize(rows) {
  const uniqueStudents = new Set();
  const uniqueSubjects = new Set();

  rows.forEach((row) => {
    if (row.student_id) {
      uniqueStudents.add(row.student_id);
    }
    if (row.subject_id) {
      uniqueSubjects.add(row.subject_id);
    }
  });

  return {
    totalRows: rows.length,
    uniqueStudents: uniqueStudents.size,
    uniqueSubjects: uniqueSubjects.size,
  };
}

export function TeacherDashboard() {
  const { token, user, logout } = useAuth();
  const { pushToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeVersion, setActiveVersion] = useState(null);
  const [allMarks, setAllMarks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsPagination, setStudentsPagination] = useState(null);

  const [versionForm, setVersionForm] = useState({
    exam_weight: "0.6",
    assignment_weight: "0.4",
  });
  const [creatingVersion, setCreatingVersion] = useState(false);

  const [marksForm, setMarksForm] = useState({
    student_id: "",
    subject_id: "",
    exam_marks: "",
    assignment_marks: "",
  });
  const [creatingMarks, setCreatingMarks] = useState(false);

  const [studentQueryId, setStudentQueryId] = useState("");
  const [studentRows, setStudentRows] = useState([]);
  const [loadingStudentReport, setLoadingStudentReport] = useState(false);

  const overview = useMemo(() => summarize(allMarks), [allMarks]);

  const fetchTeacherData = useCallback(
    async ({ manual = false } = {}) => {
      if (!token) {
        return;
      }

      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        // Teacher dashboard needs both global marks and active weights, so fetch in parallel.
        const [versionData, marksData, studentsData] = await Promise.all([
          getActiveGradingVersion({ token }),
          getAllMarksReport({ token, page: 1, perPage: 100 }),
          getRegisteredStudents({ token, page: 1, perPage: 100 }),
        ]);

        setActiveVersion(versionData || null);
        setAllMarks(marksData.items || []);
        setPagination(marksData.pagination || null);
        setStudents(studentsData.items || []);
        setStudentsPagination(studentsData.pagination || null);

        if (manual) {
          pushToast({
            type: "success",
            title: "Teacher dashboard updated",
            message: "Latest grading and marks data is loaded.",
          });
        }
      } catch (error) {
        pushToast({
          type: "error",
          title: "Failed to load dashboard",
          message: error.message || "Could not fetch teacher dashboard data.",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [pushToast, token],
  );

  useEffect(() => {
    fetchTeacherData();
  }, [fetchTeacherData]);

  const handleCreateVersion = async (event) => {
    event.preventDefault();

    const examWeight = Number(versionForm.exam_weight);
    const assignmentWeight = Number(versionForm.assignment_weight);

    if (!Number.isFinite(examWeight) || !Number.isFinite(assignmentWeight)) {
      pushToast({
        type: "error",
        title: "Invalid weights",
        message: "Exam and assignment weights must be numeric.",
      });
      return;
    }

    if (examWeight < 0 || assignmentWeight < 0) {
      pushToast({
        type: "error",
        title: "Invalid weights",
        message: "Weights must be non-negative.",
      });
      return;
    }

    if (Math.abs(examWeight + assignmentWeight - 1) > 0.000001) {
      pushToast({
        type: "error",
        title: "Weights must sum to 1.0",
        message: "Please adjust values so exam + assignment = 1.0.",
      });
      return;
    }

    setCreatingVersion(true);

    try {
      await createGradingVersion({
        token,
        payload: {
          exam_weight: examWeight,
          assignment_weight: assignmentWeight,
        },
      });

      pushToast({
        type: "success",
        title: "Grading version updated",
        message: "A new active grading version has been created.",
      });

      await fetchTeacherData({ manual: false });
    } catch (error) {
      pushToast({
        type: "error",
        title: "Failed to create version",
        message: error.message || "Could not create grading version.",
      });
    } finally {
      setCreatingVersion(false);
    }
  };

  const handleCreateMarks = async (event) => {
    event.preventDefault();

    const examMarks = Number(marksForm.exam_marks);
    const assignmentMarks = Number(marksForm.assignment_marks);

    if (!marksForm.student_id.trim() || !marksForm.subject_id.trim()) {
      pushToast({
        type: "error",
        title: "Missing IDs",
        message: "student_id and subject_id are required.",
      });
      return;
    }

    if (!Number.isFinite(examMarks) || !Number.isFinite(assignmentMarks)) {
      pushToast({
        type: "error",
        title: "Invalid marks",
        message: "Exam and assignment marks must be numeric.",
      });
      return;
    }

    if (
      examMarks < 0 ||
      examMarks > 100 ||
      assignmentMarks < 0 ||
      assignmentMarks > 100
    ) {
      pushToast({
        type: "error",
        title: "Marks out of range",
        message: "Marks must be between 0 and 100.",
      });
      return;
    }

    setCreatingMarks(true);

    try {
      const response = await createMarks({
        token,
        payload: {
          student_id: marksForm.student_id.trim(),
          subject_id: marksForm.subject_id.trim(),
          exam_marks: examMarks,
          assignment_marks: assignmentMarks,
        },
      });

      pushToast({
        type: "success",
        title: "Marks created",
        message:
          response.message || "Marks and grade were created successfully.",
      });

      setMarksForm({
        student_id: "",
        subject_id: "",
        exam_marks: "",
        assignment_marks: "",
      });

      await fetchTeacherData({ manual: false });
    } catch (error) {
      pushToast({
        type: "error",
        title: "Failed to create marks",
        message: error.message || "Could not add marks.",
      });
    } finally {
      setCreatingMarks(false);
    }
  };

  const handleFetchStudentReport = async (event) => {
    event.preventDefault();

    const studentId = studentQueryId.trim();
    if (!studentId) {
      pushToast({
        type: "error",
        title: "Missing student id",
        message: "Enter a student id to fetch report.",
      });
      return;
    }

    setLoadingStudentReport(true);

    try {
      const rows = await getStudentReport({ token, studentId });
      setStudentRows(Array.isArray(rows) ? rows : []);
      pushToast({
        type: "success",
        title: "Student report loaded",
        message: `Fetched report for ${studentId}.`,
      });
    } catch (error) {
      setStudentRows([]);
      pushToast({
        type: "error",
        title: "Failed to fetch student report",
        message: error.message || "Could not load student report.",
      });
    } finally {
      setLoadingStudentReport(false);
    }
  };

  if (loading) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-card dashboard-card-wide">
          <p className="muted-text">Loading teacher dashboard...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-card dashboard-card-wide teacher-dashboard">
        <div className="dashboard-header-row">
          <div>
            <p className="eyebrow">Teacher Workspace</p>
            <h1>Welcome, {user?.username}</h1>
            <p className="muted-text">
              Manage grading versions, marks, and reports.
            </p>
          </div>

          <div className="dashboard-actions">
            <button
              className="btn-secondary"
              type="button"
              onClick={() => fetchTeacherData({ manual: true })}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button className="btn-secondary" type="button" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        <section className="dashboard-section">
          <h2>Overview</h2>
          <div className="dashboard-grid">
            <article className="dashboard-tile">
              <h3>Rows in All Marks Report</h3>
              <p>{overview.totalRows}</p>
            </article>
            <article className="dashboard-tile">
              <h3>Unique Students</h3>
              <p>{overview.uniqueStudents}</p>
            </article>
            <article className="dashboard-tile">
              <h3>Unique Subjects</h3>
              <p>{overview.uniqueSubjects}</p>
            </article>
          </div>
          {pagination && (
            <p className="muted-text dashboard-pagination-note">
              Showing page {pagination.page} of {pagination.pages} | total
              records: {pagination.total}
            </p>
          )}
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

        <section className="dashboard-section teacher-grid-two">
          <article className="dashboard-tile teacher-form-tile">
            <h3>Create Grading Version</h3>
            <form className="auth-form" onSubmit={handleCreateVersion}>
              <label htmlFor="tv-exam-weight">Exam Weight</label>
              <input
                id="tv-exam-weight"
                type="number"
                step="0.01"
                min="0"
                value={versionForm.exam_weight}
                onChange={(event) =>
                  setVersionForm((prev) => ({
                    ...prev,
                    exam_weight: event.target.value,
                  }))
                }
                required
              />

              <label htmlFor="tv-assignment-weight">Assignment Weight</label>
              <input
                id="tv-assignment-weight"
                type="number"
                step="0.01"
                min="0"
                value={versionForm.assignment_weight}
                onChange={(event) =>
                  setVersionForm((prev) => ({
                    ...prev,
                    assignment_weight: event.target.value,
                  }))
                }
                required
              />

              <button
                className="btn-primary"
                type="submit"
                disabled={creatingVersion}
              >
                {creatingVersion ? "Creating..." : "Create Version"}
              </button>
            </form>
          </article>

          <article className="dashboard-tile teacher-form-tile">
            <h3>Add Student Marks</h3>
            <form className="auth-form" onSubmit={handleCreateMarks}>
              <label htmlFor="tm-student-id">Student ID</label>
              <input
                id="tm-student-id"
                type="text"
                value={marksForm.student_id}
                onChange={(event) =>
                  setMarksForm((prev) => ({
                    ...prev,
                    student_id: event.target.value,
                  }))
                }
                required
              />

              <label htmlFor="tm-subject-id">Subject ID</label>
              <input
                id="tm-subject-id"
                type="text"
                value={marksForm.subject_id}
                onChange={(event) =>
                  setMarksForm((prev) => ({
                    ...prev,
                    subject_id: event.target.value,
                  }))
                }
                required
              />

              <label htmlFor="tm-exam">Exam Marks</label>
              <input
                id="tm-exam"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={marksForm.exam_marks}
                onChange={(event) =>
                  setMarksForm((prev) => ({
                    ...prev,
                    exam_marks: event.target.value,
                  }))
                }
                required
              />

              <label htmlFor="tm-assignment">Assignment Marks</label>
              <input
                id="tm-assignment"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={marksForm.assignment_marks}
                onChange={(event) =>
                  setMarksForm((prev) => ({
                    ...prev,
                    assignment_marks: event.target.value,
                  }))
                }
                required
              />

              <button
                className="btn-primary"
                type="submit"
                disabled={creatingMarks}
              >
                {creatingMarks ? "Saving..." : "Add Marks"}
              </button>
            </form>
          </article>
        </section>

        <section className="dashboard-section">
          <h2>Registered Students</h2>
          {students.length === 0 ? (
            <p className="muted-text">No registered students found.</p>
          ) : (
            <>
              <div className="table-wrap">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Registered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.unique_id}>
                        <td>{student.unique_id}</td>
                        <td>{student.username}</td>
                        <td>{student.email}</td>
                        <td>{student.role}</td>
                        <td>
                          {student.created_at
                            ? new Date(student.created_at).toLocaleString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {studentsPagination && (
                <p className="muted-text dashboard-pagination-note">
                  Showing page {studentsPagination.page} of{" "}
                  {studentsPagination.pages} | total registered students:{" "}
                  {studentsPagination.total}
                </p>
              )}
            </>
          )}
        </section>

        <section className="dashboard-section">
          <h2>All Marks Report</h2>
          {allMarks.length === 0 ? (
            <p className="muted-text">No marks found.</p>
          ) : (
            <div className="table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Subject ID</th>
                    <th>Exam</th>
                    <th>Assignment</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {allMarks.map((row, index) => (
                    <tr key={`${row.student_id}-${row.subject_id}-${index}`}>
                      <td>{row.student_id}</td>
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
        </section>

        <section className="dashboard-section">
          <h2>Student Report Lookup</h2>
          <form
            className="auth-form teacher-inline-form"
            onSubmit={handleFetchStudentReport}
          >
            <label htmlFor="teacher-student-report-id">Student ID</label>
            <input
              id="teacher-student-report-id"
              type="text"
              value={studentQueryId}
              onChange={(event) => setStudentQueryId(event.target.value)}
              required
            />
            <button
              className="btn-primary"
              type="submit"
              disabled={loadingStudentReport}
            >
              {loadingStudentReport ? "Loading..." : "Fetch Report"}
            </button>
          </form>

          {studentRows.length === 0 ? (
            <p className="muted-text">No student report loaded yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Subject ID</th>
                    <th>Exam</th>
                    <th>Assignment</th>
                    <th>Grade</th>
                    <th>Version ID</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRows.map((row, index) => (
                    <tr key={`${row.subject_id}-${index}`}>
                      <td>{row.subject_id}</td>
                      <td>{row.exam_marks}</td>
                      <td>{row.assignment_marks}</td>
                      <td>{row.grade ?? "N/A"}</td>
                      <td>{row.grading_version_id ?? "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
