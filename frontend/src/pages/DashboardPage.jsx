import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/task.service';

const StatCard = ({ label, value, color, sub }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskService.getAll({ limit: 100 })
      .then(({ data }) => setTasks(data.data.tasks || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    high: tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length,
  };

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
  );

  const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const completionRate = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Here's what's happening with your tasks today.</p>
        </div>
        <Link to="/tasks" className="btn-primary flex items-center gap-2">
          <span>+</span> New Task
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={counts.total} color="bg-blue-500" sub="All time" />
        <StatCard label="To Do" value={counts.todo} color="bg-gray-400" sub="Pending" />
        <StatCard label="In Progress" value={counts.inProgress} color="bg-blue-400" sub="Active" />
        <StatCard label="Completed" value={counts.completed} color="bg-green-500" sub={`${completionRate}% done`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Progress */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Task Overview</h2>
          <div className="space-y-4">
            {[
              { label: 'Completed', count: counts.completed, total: counts.total, color: 'bg-green-500' },
              { label: 'In Progress', count: counts.inProgress, total: counts.total, color: 'bg-blue-500' },
              { label: 'To Do', count: counts.todo, total: counts.total, color: 'bg-gray-300' },
            ].map(({ label, count, total, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {counts.high > 0 && (
            <div className="mt-5 p-3 bg-red-50 rounded-xl flex items-center gap-3">
              <span className="text-red-500 text-lg">⚠</span>
              <div>
                <p className="text-sm font-medium text-red-700">{counts.high} high-priority task{counts.high > 1 ? 's' : ''} pending</p>
                <Link to="/tasks?priority=high" className="text-xs text-red-500 hover:underline">View them →</Link>
              </div>
            </div>
          )}
        </div>

        {/* Overdue */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Overdue Tasks</h2>
          {overdueTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-sm text-gray-500">No overdue tasks!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueTasks.slice(0, 4).map((task) => (
                <div key={task._id} className="flex items-start gap-2.5 text-sm">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800 line-clamp-1">{task.title}</p>
                    <p className="text-xs text-red-500">
                      Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
              {overdueTasks.length > 4 && (
                <Link to="/tasks" className="text-xs text-blue-600 hover:underline block">
                  +{overdueTasks.length - 4} more
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent tasks */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Tasks</h2>
          <Link to="/tasks" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
        </div>
        {recentTasks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm mb-3">No tasks yet</p>
            <Link to="/tasks" className="btn-primary inline-flex">Create your first task</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentTasks.map((task) => (
              <div key={task._id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge text-xs ${
                    task.status === 'completed' ? 'bg-green-100 text-green-700' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {task.status === 'in-progress' ? 'In Progress' : task.status === 'completed' ? 'Done' : 'To Do'}
                  </span>
                  <span className={`badge text-xs ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                    task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
