import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, createProject } from '../api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getProjects()
      .then(res => setProjects(res.data))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Project name is required'); return; }
    setCreating(true); setError('');
    try {
      const res = await createProject(form);
      setProjects(p => [res.data, ...p]);
      setShowModal(false);
      setForm({ name: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="loader-page"><div className="spinner" /></div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '32px 24px' }}>
      <div className="flex-between mb-24">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} you're part of</p>
        </div>
        <button id="new-project-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      {error && <div className="alert alert-error mb-16">⚠️ {error}</div>}

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <div className="empty-title">No projects yet</div>
          <div className="empty-desc">Create your first project to start collaborating with your team.</div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Project</button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => {
            const total = p._count?.tasks || 0;
            return (
              <Link key={p.id} to={`/projects/${p.id}`} className="project-card animate-slide-up">
                <div className="flex-between mb-8">
                  <span className={`badge badge-${p.myRole.toLowerCase()}`}>{p.myRole}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="project-card-name">{p.name}</div>
                <div className="project-card-desc">
                  {p.description || 'No description provided.'}
                </div>
                <div className="project-card-meta">
                  <div className="project-card-stats">
                    <span className="project-stat-item">📋 {total} task{total !== 1 ? 's' : ''}</span>
                    <span className="project-stat-item">👥 {p._count?.members || 1} member{p._count?.members !== 1 ? 's' : ''}</span>
                  </div>
                  <span style={{ fontSize: 18, color: 'var(--accent-light)' }}>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal animate-slide-up">
            <div className="modal-header">
              <h2 className="modal-title">📁 New Project</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input
                  id="project-name-input"
                  className="form-input"
                  placeholder="My Awesome Project"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  id="project-desc-input"
                  className="form-textarea"
                  placeholder="What's this project about?"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="create-project-submit" type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating…' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
