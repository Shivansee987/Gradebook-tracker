import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignupForm } from "../../../components/Signup/SignupForm";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../../../shared/toast/useToast";

export function SignupPage() {
  const { signup } = useAuth();
  const { pushToast } = useToast();
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

      pushToast({
        type: "success",
        title: "Account created",
        message: result.message || "You can now sign in with your credentials.",
      });

      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (err) {
      setError(err.message);
      pushToast({
        type: "error",
        title: "Signup failed",
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
