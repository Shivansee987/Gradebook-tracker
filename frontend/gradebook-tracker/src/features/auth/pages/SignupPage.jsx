import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignupForm } from "../../../components/Signup/SignupForm";
import { useAuth } from "../hooks/useAuth";

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await signup(values);
      setSuccess(
        result.message || "Account created successfully. You can now log in.",
      );
      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-copy">
          <p className="eyebrow">Gradebook Tracker</p>
          <h1>Create your account</h1>
          <p className="muted-text">
            Start with a student role or choose teacher/admin if you have
            permissions.
          </p>
        </div>

        <SignupForm
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          success={success}
        />

        <p className="switch-auth">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
