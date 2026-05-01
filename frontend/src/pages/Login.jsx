import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (f) => (e) => setForm(x => ({ ...x, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('All fields are required'); return; }
    setLoading(true); setError('');
    try {
      const res = await loginApi(form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-blob" style={{ width: 400, height: 400, background: '#6366f1', top: -80, left: -100 }} />
      <div className="auth-bg-blob" style={{ width: 350, height: 350, background: '#8b5cf6', bottom: -60, right: -80 }} />
      <div className="auth-card animate-slide-up">
        <div className="auth-logo">⚡ TaskFlow</div>
        <div className="auth-tagline">Your team's command center</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your workspace</p>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input id="login-email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={set('email')} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input id="login-password" type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={set('password')} />
          </div>
          <button id="login-btn" type="submit" className="btn btn-primary w-full" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Sign up free</Link>
        </div>
      </div>
    </div>
  );
}
