import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProject, updateTaskStatus } from '../api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import MemberModal from '../components/MemberModal';

const COLUMNS = [
  { key: 'TODO', label: 'To Do', cls: 'kanban-todo' },
  { key: 'IN_PROGRESS', label: 'In Progress', cls: 'kanban-inprogress' },
  { key: 'DONE', label: 'Done', cls: 'kanban-done' }
];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [activeTab, setActiveTab] = useState('board');

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const res = await getProject(id);
      setProject(res.data);
    } catch {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const openTask = (task) => { setSelectedTask(task); setShowTaskModal(true); };
  const openNew = () => { setSelectedTask(null); setShowTaskModal(true); };

  const handleTaskSaved = (saved) => {
    setProject(p => ({
      ...p,
      tasks: selectedTask
        ? p.tasks.map(t => t.id === saved.id ? saved : t)
        : [saved, ...p.tasks]
    }));
    setShowTaskModal(false);
  };

  const handleTaskDeleted = (taskId) => {
    setProject(p => ({ ...p, tasks: p.tasks.filter(t => t.id !== taskId) }));
    setShowTaskModal(false);
  };

  const handleMemberAdded = (member) => {
    setProject(p => ({ ...p, members: [...p.members, member] }));
    setShowMemberModal(false);
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await updateTaskStatus(id, task.id, newStatus);
      setProject(p => ({ ...p, tasks: p.tasks.map(t => t.id === res.data.id ? res.data : t) }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading) return <div className="loader-page"><div className="spinner" /></div>;
  if (error) return <div className="container mt-24"><div className="alert alert-error">{error}</div></div>;
  if (!project) return null;

  const myRole = project.myRole;
  const memberIds = project.members.map(m => m.user.id);
  const tasksByStatus = (status) => project.tasks.filter(t => t.status === status);

  return (
    <div className="container animate-fade-in" style={{ padding: '32px 24px' }}>
      {/* Header */}
      <div className="flex-between mb-24">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Link to="/projects" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14 }}>← Projects</Link>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{project.name}</span>
          </div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>{project.name}</h1>
          {project.description && <p className="page-subtitle">{project.description}</p>}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <span className={`badge badge-${myRole.toLowerCase()}`}>You: {myRole}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>👥 {project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>📋 {project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {myRole === 'ADMIN' && (
            <>
              <button className="btn btn-secondary btn-sm" id="invite-member-btn" onClick={() => setShowMemberModal(true)}>
                👥 Invite
              </button>
              <Link to={`/projects/${id}/settings`} className="btn btn-secondary btn-sm">⚙️ Settings</Link>
            </>
          )}
          <button id="new-task-btn" className="btn btn-primary btn-sm" onClick={openNew}>
            + New Task
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}>📋 Board</button>
        <button className={`tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>👥 Members</button>
      </div>

      {activeTab === 'board' && (
        <div className="kanban-board">
          {COLUMNS.map(col => (
            <div key={col.key} className={`kanban-column ${col.cls}`}>
              <div className="kanban-header">
                <span className="kanban-title">{col.label}</span>
                <span className="kanban-count">{tasksByStatus(col.key).length}</span>
              </div>
              <div className="kanban-tasks">
                {tasksByStatus(col.key).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                    No tasks here
                  </div>
                )}
                {tasksByStatus(col.key).map(task => (
                  <div key={task.id}>
                    <TaskCard task={task} onClick={openTask} />
                    {/* Quick status move buttons */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: 'flex-end' }}>
                      {col.key !== 'TODO' && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 11, padding: '3px 8px' }}
                          onClick={() => handleStatusChange(task, COLUMNS[COLUMNS.findIndex(c => c.key === col.key) - 1].key)}
                          title="Move back"
                        >← Back</button>
                      )}
                      {col.key !== 'DONE' && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 11, padding: '3px 8px', color: 'var(--accent-light)' }}
                          onClick={() => handleStatusChange(task, COLUMNS[COLUMNS.findIndex(c => c.key === col.key) + 1].key)}
                          title="Move forward"
                        >Move → </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'members' && (
        <div style={{ maxWidth: 600 }}>
          {project.members.map(m => {
            const initials = m.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const isOwner = m.user.id === project.ownerId;
            return (
              <div key={m.user.id} className="member-item">
                <div className="member-info">
                  <div className="member-avatar">{initials}</div>
                  <div>
                    <div className="member-name">{m.user.name} {isOwner && '👑'}</div>
                    <div className="member-email">{m.user.email}</div>
                  </div>
                </div>
                <span className={`badge badge-${m.role.toLowerCase()}`}>{m.role}</span>
              </div>
            );
          })}
          {myRole === 'ADMIN' && (
            <button className="btn btn-primary btn-sm mt-16" onClick={() => setShowMemberModal(true)}>
              + Invite Member
            </button>
          )}
        </div>
      )}

      {showTaskModal && (
        <TaskModal
          projectId={id}
          task={selectedTask}
          members={project.members}
          myRole={myRole}
          onClose={() => setShowTaskModal(false)}
          onSaved={handleTaskSaved}
          onDeleted={handleTaskDeleted}
        />
      )}

      {showMemberModal && (
        <MemberModal
          projectId={id}
          existingMemberIds={memberIds}
          onClose={() => setShowMemberModal(false)}
          onAdded={handleMemberAdded}
        />
      )}
    </div>
  );
}
