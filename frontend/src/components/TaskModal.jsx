import { useState, useEffect } from 'react';
import { createTask, updateTask, deleteTask } from '../api';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

export default function TaskModal({ projectId, task, members, myRole, onClose, onSaved, onDeleted }) {
  const { user } = useAuth();
  const isEdit = !!task;
  const canEdit = myRole === 'ADMIN' || (task && task.creatorId === user?.id);
  const canDelete = myRole === 'ADMIN';

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    assigneeId: task?.assigneeId || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true); setError('');
    try {
      const payload = { ...form, assigneeId: form.assigneeId || null, dueDate: form.dueDate || null };
      const res = isEdit
        ? await updateTask(projectId, task.id, payload)
        : await createTask(projectId, payload);
      onSaved(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    setLoading(true);
    try {
      await deleteTask(projectId, task.id);
      onDeleted(task.id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Task' : '✨ New Task'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              id="task-title"
              className="form-input"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={set('title')}
              disabled={isEdit && !canEdit}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              id="task-description"
              className="form-textarea"
              placeholder="Add more details..."
              value={form.description}
              onChange={set('description')}
              disabled={isEdit && !canEdit}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select id="task-status" className="form-select" value={form.status} onChange={set('status')}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select id="task-priority" className="form-select" value={form.priority} onChange={set('priority')}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                id="task-due-date"
                type="date"
                className="form-input"
                value={form.dueDate}
                onChange={set('dueDate')}
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select id="task-assignee" className="form-select" value={form.assigneeId} onChange={set('assigneeId')}>
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            {isEdit && canDelete && (
              <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete} disabled={loading}>
                🗑 Delete
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            {(!isEdit || canEdit) && (
              <button type="submit" id="task-submit-btn" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
