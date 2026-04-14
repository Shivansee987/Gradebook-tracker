import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LoginForm } from "../../../components/Login/LoginForm";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../../../shared/toast/useToast";

export function LoginPage() {
  const { login } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setError("");
    setLoading(true);

    try {
      const result = await login(values);
      pushToast({
        type: "success",
        title: "Welcome back",
        message: "Login successful.",
      });

      if (result?.user?.role === "teacher") {
        navigate("/teacher/dashboard");
      } else if (result?.user?.role === "student") {
        navigate("/students/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
      pushToast({
        type: "error",
        title: "Login failed",
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-copy">
          <p className="eyebrow">Gradebook Tracker</p>
          <h1>Sign in to your workspace</h1>
          <p className="muted-text">
            Manage grading, reports, and marks from one place.
          </p>
        </div>

        <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />

        <p className="switch-auth">
          Need an account? <Link to="/signup">Create one</Link>
        </p>
      </section>
    </main>
  );
}
