const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');

// Routes protégées
router.post('/', authMiddleware, taskController.createTask);
router.get('/', authMiddleware, taskController.getTasksByUser);
router.put('/:id', authMiddleware, taskController.updateTask);
router.delete('/:id', authMiddleware, taskController.deleteTask);

module.exports = router;