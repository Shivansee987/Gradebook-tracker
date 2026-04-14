import { useState } from "react";
import { ROLE_OPTIONS } from "../../features/auth/constants/roles";

export function SignupForm({ onSubmit, loading, error, success }) {
  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
  });

  const updateField = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
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

      {error && <p className="message message-error">{error}</p>}
      {success && <p className="message message-success">{success}</p>}

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
