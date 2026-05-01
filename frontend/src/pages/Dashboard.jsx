import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api';
import { useAuth } from '../context/AuthContext';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-page"><div className="spinner" /></div>;
  if (error) return <div className="container mt-24"><div className="alert alert-error">{error}</div></div>;

  const { stats, overdueTasks, upcomingTasks, recentProjects } = data;

  return (
    <div className="container animate-fade-in" style={{ padding: '32px 24px' }}>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Good day, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's what's happening across your projects.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card stat-accent">
          <div className="stat-icon">📁</div>
          <div className="stat-value">{stats.totalProjects}</div>
          <div className="stat-label">Active Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.completedTasks}</div>
          <div className="stat-label">Completed Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-value" style={{ color: 'var(--info)' }}>{stats.inProgressTasks}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value" style={{ color: stats.overdueTasks > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
            {stats.overdueTasks}
          </div>
          <div className="stat-label">Overdue Tasks</div>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueTasks.length > 0 && (
        <div className="overdue-banner animate-fade-in">
          <div className="overdue-title">🚨 Overdue Tasks ({overdueTasks.length})</div>
          <div className="overdue-tasks">
            {overdueTasks.slice(0, 4).map(t => (
              <div key={t.id} className="overdue-task-item">
                <span style={{ fontWeight: 600 }}>{t.title}</span>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ color: 'var(--danger)', fontSize: 13 }}>Due {formatDate(t.dueDate)}</span>
                  <Link to={`/projects/${t.projectId}`} className="btn btn-sm btn-danger">View →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* My Upcoming Tasks */}
        <div>
          <div className="section-title">📋 My Upcoming Tasks</div>
          {upcomingTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-icon">🎉</div>
              <div className="empty-title">All caught up!</div>
              <div className="empty-desc">No tasks assigned to you right now.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingTasks.map(t => (
                <Link key={t.id} to={`/projects/${t.projectId}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '14px 18px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          📁 {t.project?.name}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <span className={`badge badge-${t.status === 'IN_PROGRESS' ? 'in-progress' : 'todo'}`}>
                          {t.status === 'IN_PROGRESS' ? 'In Progress' : 'To Do'}
                        </span>
                        {t.dueDate && (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📅 {formatDate(t.dueDate)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div>
          <div className="section-title">📁 Recent Projects</div>
          {recentProjects.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-icon">📦</div>
              <div className="empty-title">No projects yet</div>
              <Link to="/projects" className="btn btn-primary btn-sm">Create Project</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentProjects.map(p => {
                const pct = p.taskStats.total > 0
                  ? Math.round((p.taskStats.done / p.taskStats.total) * 100) : 0;
                return (
                  <Link key={p.id} to={`/projects/${p.id}`} className="card" style={{ padding: '18px 20px', textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <div className="flex-between mb-8">
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                      <span className={`badge badge-${p.myRole.toLowerCase()}`}>{p.myRole}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                      {p.taskStats.done}/{p.taskStats.total} tasks done · {p.taskStats.inProgress} in progress
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
