import { useState } from "react";

export function LoginForm({ onSubmit, loading, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const nextErrors = {};

    // Basic email shape validation catches common typos before sending to server.
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      nextErrors.email =
        "Enter a valid email address (example: name@school.edu).";
    }

    // Backend requires at least 8 chars; mirror that here for instant feedback.
    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      email: email.trim().toLowerCase(),
      password,
    });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="login-email">Email</label>
      <input
        id="login-email"
        type="email"
        placeholder="name@school.edu"
        autoComplete="email"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (validationErrors.email) {
            setValidationErrors((prev) => ({ ...prev, email: "" }));
          }
        }}
        required
      />
      {validationErrors.email && (
        <p className="message message-error">{validationErrors.email}</p>
      )}

      <label htmlFor="login-password">Password</label>
      <input
        id="login-password"
        type="password"
        placeholder="At least 8 characters"
        autoComplete="current-password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          if (validationErrors.password) {
            setValidationErrors((prev) => ({ ...prev, password: "" }));
          }
        }}
        required
      />
      {validationErrors.password && (
        <p className="message message-error">{validationErrors.password}</p>
      )}

      {error && <p className="message message-error">{error}</p>}

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
