import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProject, updateProject, deleteProject, removeMember, updateMember } from '../api';
import { useAuth } from '../context/AuthContext';
import MemberModal from '../components/MemberModal';

export default function ProjectSettings() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    getProject(id).then(res => {
      const p = res.data;
      if (p.myRole !== 'ADMIN') { navigate(`/projects/${id}`); return; }
      setProject(p);
      setForm({ name: p.name, description: p.description || '' });
    }).catch(() => setError('Failed to load project')).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await updateProject(id, form);
      setProject(p => ({ ...p, ...form }));
      setSuccess('Project updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteProject(id);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete project');
      setDeleting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await removeMember(id, memberId);
      setProject(p => ({ ...p, members: p.members.filter(m => m.user.id !== memberId) }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove member');
    }
  };

  const handleChangeRole = async (memberId, newRole) => {
    try {
      const res = await updateMember(id, memberId, { role: newRole });
      setProject(p => ({
        ...p,
        members: p.members.map(m => m.user.id === memberId ? { ...m, role: res.data.role } : m)
      }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change role');
    }
  };

  if (loading) return <div className="loader-page"><div className="spinner" /></div>;
  if (!project) return null;

  const isOwner = project.ownerId === user?.id;

  return (
    <div className="container animate-fade-in" style={{ padding: '32px 24px', maxWidth: 760 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Link to={`/projects/${id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14 }}>← {project.name}</Link>
        </div>
        <h1 className="page-title">⚙️ Project Settings</h1>
      </div>

      {error && <div className="alert alert-error mb-16">⚠️ {error}</div>}
      {success && <div className="alert alert-success mb-16">✅ {success}</div>}

      {/* Edit Project */}
      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Project Details</h2>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              id="settings-project-name"
              className="form-input"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              id="settings-project-desc"
              className="form-textarea"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <button id="save-project-btn" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : '💾 Save Changes'}
          </button>
        </form>
      </div>

      {/* Members */}
      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <div className="flex-between mb-16">
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Members ({project.members.length})</h2>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowInvite(true)}>+ Invite</button>
        </div>
        {project.members.map(m => {
          const isOwnerMember = m.user.id === project.ownerId;
          const initials = m.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
          return (
            <div key={m.user.id} className="member-item">
              <div className="member-info">
                <div className="member-avatar">{initials}</div>
                <div>
                  <div className="member-name">{m.user.name} {isOwnerMember && '👑'}</div>
                  <div className="member-email">{m.user.email}</div>
                </div>
              </div>
              <div className="member-actions">
                {!isOwnerMember && (
                  <>
                    <select
                      className="form-select"
                      style={{ padding: '4px 8px', fontSize: 13 }}
                      value={m.role}
                      onChange={e => handleChangeRole(m.user.id, e.target.value)}
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveMember(m.user.id)}
                    >Remove</button>
                  </>
                )}
                {isOwnerMember && <span className="badge badge-admin">Owner</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Danger Zone */}
      {isOwner && (
        <div className="card" style={{ padding: 28, borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.04)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)', marginBottom: 12 }}>⚠️ Danger Zone</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
            Permanently delete this project and all its tasks. This action cannot be undone.
          </p>
          <button id="delete-project-btn" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : '🗑 Delete Project'}
          </button>
        </div>
      )}

      {showInvite && (
        <MemberModal
          projectId={id}
          existingMemberIds={project.members.map(m => m.user.id)}
          onClose={() => setShowInvite(false)}
          onAdded={(member) => {
            setProject(p => ({ ...p, members: [...p.members, member] }));
            setShowInvite(false);
          }}
        />
      )}
    </div>
  );
}
