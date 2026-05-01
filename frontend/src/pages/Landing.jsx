import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '🔐', title: 'Role-Based Access', desc: 'Admins and Members get different permissions. Full control over who can do what.' },
  { icon: '📋', title: 'Kanban Task Board', desc: 'Visualize work in To Do, In Progress, and Done columns. Drag tasks to update status.' },
  { icon: '👥', title: 'Team Management', desc: 'Invite teammates to projects, assign roles, and collaborate in real-time.' },
  { icon: '📊', title: 'Live Dashboard', desc: 'See all your tasks, overdue alerts, and project progress at a glance.' },
  { icon: '⚡', title: 'Priority Tracking', desc: 'Mark tasks as Low, Medium, or High priority to focus on what matters most.' },
  { icon: '📅', title: 'Due Dates & Overdue', desc: 'Set deadlines and get instant overdue alerts so nothing slips through.' }
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="page" style={{ background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <span className="navbar-logo">⚡ TaskFlow</span>
          <div style={{ display: 'flex', gap: 12 }}>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        {/* Background blobs */}
        <div className="auth-bg-blob" style={{ width: 500, height: 500, background: '#6366f1', top: -100, left: -150 }} />
        <div className="auth-bg-blob" style={{ width: 400, height: 400, background: '#8b5cf6', bottom: 0, right: -100 }} />

        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 13, color: 'var(--accent-light)', marginBottom: 24 }}>
            🚀 Now with role-based access control
          </div>
          <h1 className="hero-title">
            Manage Projects &<br />
            <span className="hero-gradient">Track Tasks Together</span>
          </h1>
          <p className="hero-subtitle">
            TaskFlow gives your team a beautiful, fast workspace to create projects, assign tasks, and ship work — with full Admin & Member access control.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">🚀 Start for Free</Link>
            <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 48 }}>
            Everything your team needs
          </h2>
          <div className="features-grid">
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 24, padding: '48px 32px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Ready to get started?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Create your account in seconds. No credit card required.</p>
          <Link to="/register" className="btn btn-primary btn-lg">Create Free Account →</Link>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 13 }}>
        © 2025 TaskFlow — Built with ❤️ for teams
      </footer>
    </div>
  );
}
