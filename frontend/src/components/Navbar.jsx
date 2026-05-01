import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-logo">⚡ TaskFlow</Link>
        <div className="navbar-links">
          <Link
            to="/dashboard"
            className={`navbar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >Dashboard</Link>
          <Link
            to="/projects"
            className={`navbar-link ${location.pathname.startsWith('/projects') ? 'active' : ''}`}
          >Projects</Link>
        </div>
        <div className="navbar-user">
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{user?.name}</span>
          <div className="user-avatar" title="Logout" onClick={handleLogout}>
            {initials}
          </div>
        </div>
      </div>
    </nav>
  );
}
