const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');
const { taskValidator } = require('../middleware/validation.middleware');

router.use(protect); // All task routes require authentication

router.route('/')
  .get(getTasks)
  .post(taskValidator, createTask);

router.route('/:id')
  .put(taskValidator, updateTask)
  .delete(deleteTask);

module.exports = router;
