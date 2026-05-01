import { useState, useRef } from 'react';
import { searchUsers, addMember } from '../api';

export default function MemberModal({ projectId, existingMemberIds, onClose, onAdded }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounce = useRef(null);

  const handleSearch = (e) => {
    const q = e.target.value;
    setQuery(q);
    setSelected(null);
    clearTimeout(debounce.current);
    if (q.length < 2) { setResults([]); return; }
    debounce.current = setTimeout(async () => {
      try {
        const res = await searchUsers(q);
        setResults(res.data.filter(u => !existingMemberIds.includes(u.id)));
      } catch {}
    }, 300);
  };

  const handleSelect = (user) => {
    setSelected(user);
    setQuery(user.name);
    setResults([]);
  };

  const handleAdd = async () => {
    if (!selected) { setError('Select a user first'); return; }
    setLoading(true); setError('');
    try {
      const res = await addMember(projectId, { userId: selected.id, role });
      onAdded(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h2 className="modal-title">👥 Invite Member</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <div className="form-group relative">
          <label className="form-label">Search by name or email</label>
          <input
            id="member-search"
            className="form-input"
            placeholder="e.g. John or john@example.com"
            value={query}
            onChange={handleSearch}
            autoFocus
          />
          {results.length > 0 && (
            <div className="search-results-list">
              {results.map(u => (
                <div key={u.id} className="search-result-item" onClick={() => handleSelect(u)}>
                  <div className="mini-avatar" style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>
                    {u.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <select id="member-role" className="form-select" value={role} onChange={e => setRole(e.target.value)}>
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button id="member-invite-btn" className="btn btn-primary" onClick={handleAdd} disabled={loading || !selected}>
            {loading ? 'Inviting…' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
}
