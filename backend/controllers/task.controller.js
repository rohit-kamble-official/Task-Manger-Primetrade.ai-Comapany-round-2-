const Task = require('../models/Task.model');
const { sendSuccess, sendError } = require('../utils/response.utils');

// @desc    Get all tasks (user sees own, admin sees all)
// @route   GET /api/v1/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;

    const query = {};

    // Admins see all tasks; users see only their own
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return sendSuccess(res, 200, 'Tasks fetched successfully.', {
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a task
// @route   POST /api/v1/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      user: req.user._id,
    });

    const populated = await task.populate('user', 'name email role');

    return sendSuccess(res, 201, 'Task created successfully.', { task: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a task
// @route   PUT /api/v1/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return sendError(res, 404, 'Task not found.');
    }

    // Only owner or admin can update
    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'You are not authorized to update this task.');
    }

    const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();
    const populated = await task.populate('user', 'name email role');

    return sendSuccess(res, 200, 'Task updated successfully.', { task: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return sendError(res, 404, 'Task not found.');
    }

    // Only owner or admin can delete
    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'You are not authorized to delete this task.');
    }

    await task.deleteOne();

    return sendSuccess(res, 200, 'Task deleted successfully.', { taskId: req.params.id });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
