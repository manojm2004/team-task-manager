import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (f) => (e) => setForm(x => ({ ...x, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('All fields are required'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await registerApi(form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-blob" style={{ width: 450, height: 450, background: '#6366f1', top: -100, right: -120 }} />
      <div className="auth-bg-blob" style={{ width: 350, height: 350, background: '#8b5cf6', bottom: -60, left: -80 }} />
      <div className="auth-card animate-slide-up">
        <div className="auth-logo">⚡ TaskFlow</div>
        <div className="auth-tagline">Your team's command center</div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Get started in under a minute</p>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input id="reg-name" type="text" className="form-input" placeholder="John Doe" value={form.name} onChange={set('name')} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input id="reg-email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input id="reg-password" type="password" className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} />
          </div>
          <button id="register-btn" type="submit" className="btn btn-primary w-full" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
