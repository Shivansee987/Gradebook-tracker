import { useAuth } from "../features/auth/hooks/useAuth";

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <p className="eyebrow">Gradebook Tracker</p>
        <h1>Welcome, {user?.username}</h1>
        <p className="muted-text">
          You are logged in as <strong>{user?.role}</strong>. Your auth is
          connected to the Flask backend.
        </p>
        <div className="dashboard-meta">
          <span>Email: {user?.email}</span>
          <span>User ID: {user?.unique_id}</span>
        </div>
        <button className="btn-secondary" onClick={logout} type="button">
          Logout
        </button>
      </section>
    </main>
  );
}
