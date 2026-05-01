const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
const STATUS_CLASS = { TODO: 'badge-todo', IN_PROGRESS: 'badge-in-progress', DONE: 'badge-done' };
const PRIORITY_CLASS = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high' };

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(d) {
  return d && new Date(d) < new Date();
}

export default function TaskCard({ task, onClick }) {
  const initials = task.assignee?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="task-card animate-fade-in" onClick={() => onClick(task)}>
      <div className="task-card-title">{task.title}</div>
      {task.description && (
        <div className="task-card-desc">{task.description}</div>
      )}
      <div className="task-card-meta">
        <div className="task-card-badges">
          <span className={`badge ${PRIORITY_CLASS[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {task.dueDate && (
            <span className={`task-due ${isOverdue(task.dueDate) && task.status !== 'DONE' ? 'overdue' : ''}`}>
              📅 {formatDate(task.dueDate)}
            </span>
          )}
          {task.assignee && (
            <div className="task-assignee">
              <div className="mini-avatar">{initials}</div>
              <span>{task.assignee.name.split(' ')[0]}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
