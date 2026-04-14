import { useState } from "react";
import { ROLE_OPTIONS } from "../../features/auth/constants/roles";

export function SignupForm({ onSubmit, loading, error, success }) {
  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
  });
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const nextErrors = {};

    // Keep username readable and safe for future usage in URLs/search.
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(formValues.username.trim())) {
      nextErrors.username =
        "Username must be 3-30 chars and contain only letters, numbers, or _.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formValues.email.trim().toLowerCase())) {
      nextErrors.email = "Enter a valid email address.";
    }

    // Strong password policy improves account security before data reaches API.
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!strongPasswordRegex.test(formValues.password)) {
      nextErrors.password =
        "Use 8+ chars with upper, lower, number, and special character.";
    }

    if (!ROLE_OPTIONS.includes(formValues.role)) {
      nextErrors.role = "Choose a valid role.";
    }

    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateField = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));

    // Clear the field error as user edits so feedback feels responsive.
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      username: formValues.username.trim(),
      email: formValues.email.trim().toLowerCase(),
      password: formValues.password,
      role: formValues.role,
    });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="signup-username">Username</label>
      <input
        id="signup-username"
        type="text"
        placeholder="e.g. shivansee"
        autoComplete="username"
        value={formValues.username}
        onChange={updateField("username")}
        required
      />
      {validationErrors.username && (
        <p className="message message-error">{validationErrors.username}</p>
      )}

      <label htmlFor="signup-email">Email</label>
      <input
        id="signup-email"
        type="email"
        placeholder="name@school.edu"
        autoComplete="email"
        value={formValues.email}
        onChange={updateField("email")}
        required
      />
      {validationErrors.email && (
        <p className="message message-error">{validationErrors.email}</p>
      )}

      <label htmlFor="signup-password">Password</label>
      <input
        id="signup-password"
        type="password"
        placeholder="Minimum 8 characters"
        autoComplete="new-password"
        minLength={8}
        value={formValues.password}
        onChange={updateField("password")}
        required
      />
      {validationErrors.password && (
        <p className="message message-error">{validationErrors.password}</p>
      )}

      <label htmlFor="signup-role">Role</label>
      <select
        id="signup-role"
        value={formValues.role}
        onChange={updateField("role")}
      >
        {ROLE_OPTIONS.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      {validationErrors.role && (
        <p className="message message-error">{validationErrors.role}</p>
      )}

      {error && <p className="message message-error">{error}</p>}
      {success && <p className="message message-success">{success}</p>}

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
