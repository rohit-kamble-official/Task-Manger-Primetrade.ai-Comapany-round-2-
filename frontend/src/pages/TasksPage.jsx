import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/task.service';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const STATUSES = ['all', 'todo', 'in-progress', 'completed'];
const PRIORITIES = ['all', 'low', 'medium', 'high'];

const statusLabel = { all: 'All', todo: 'To Do', 'in-progress': 'In Progress', completed: 'Completed' };
const priorityLabel = { all: 'All', low: 'Low', medium: 'Medium', high: 'High' };

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchTasks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterPriority !== 'all') params.priority = filterPriority;
      const { data } = await taskService.getAll(params);
      setTasks(data.data.tasks || []);
      setPagination(data.data.pagination || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority]);

  useEffect(() => { fetchTasks(1); }, [fetchTasks]);

  const handleSave = async (formData) => {
    if (editTask) {
      await taskService.update(editTask._id, formData);
    } else {
      await taskService.create(formData);
    }
    setEditTask(null);
    fetchTasks(1);
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    await taskService.delete(id);
    setDeleteConfirm(null);
    fetchTasks(pagination.page);
  };

  const openCreate = () => {
    setEditTask(null);
    setModalOpen(true);
  };

  // Client-side search filter
  const visibleTasks = search.trim()
    ? tasks.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
      )
    : tasks;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {user?.role === 'admin' ? 'Managing all tasks' : 'Your personal task list'}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <span className="text-lg leading-none">+</span> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="flex-1 min-w-48">
          <input
            className="input-field"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Status:</span>
          <div className="flex gap-1">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filterStatus === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {statusLabel[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Priority:</span>
          <div className="flex gap-1">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filterPriority === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {priorityLabel[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : visibleTasks.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-900 font-semibold">No tasks found</p>
          <p className="text-gray-500 text-sm mt-1 mb-5">
            {search ? 'Try a different search term.' : 'Create your first task to get started.'}
          </p>
          {!search && (
            <button onClick={openCreate} className="btn-primary">
              + Create Task
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="text-xs text-gray-400 font-medium">
            Showing {visibleTasks.length} of {pagination.total} tasks
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteConfirm(id)}
                showOwner={user?.role === 'admin'}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => fetchTasks(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchTasks(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Task modal */}
      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null); }}
        onSave={handleSave}
        task={editTask}
      />

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <p className="text-3xl mb-3">🗑</p>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Delete Task?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
