const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// A new route for handling user registration
router.post('/register', authController.registerUser);

// A new route for handling user login
router.post('/login', authController.loginUser);

module.exports = router;