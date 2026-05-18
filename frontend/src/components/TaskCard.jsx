import React from 'react';

const statusConfig = {
  'todo': { label: 'To Do', cls: 'bg-gray-100 text-gray-600' },
  'in-progress': { label: 'In Progress', cls: 'bg-blue-100 text-blue-700' },
  'completed': { label: 'Completed', cls: 'bg-green-100 text-green-700' },
};

const priorityConfig = {
  'low': { label: 'Low', cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  'medium': { label: 'Medium', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  'high': { label: 'High', cls: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

export default function TaskCard({ task, onEdit, onDelete, showOwner }) {
  const status = statusConfig[task.status] || statusConfig.todo;
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{task.title}</h3>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            ✎
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className={`badge ${status.cls}`}>{status.label}</span>
        <span className={`badge ${priority.cls} flex items-center gap-1`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
          {priority.label}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        {task.dueDate ? (
          <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            {isOverdue ? '⚠ ' : ''}Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        ) : (
          <span className="text-xs text-gray-300">No due date</span>
        )}

        {showOwner && task.user && (
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
            {task.user.name}
          </span>
        )}
      </div>
    </div>
  );
}
