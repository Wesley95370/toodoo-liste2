const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Routes publiques
router.post('/register', userController.register);
router.post('/login', userController.login);

// Routes protégées
router.get('/:id', authMiddleware, userController.getUserById);
router.put('/update', authMiddleware, userController.updateUser);
router.delete('/delete', authMiddleware, userController.deleteUser);

module.exports = router;