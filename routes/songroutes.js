// routes/songsRoutes.js

const express = require('express');
const router = express.Router();

const {
  getAllSongs,
  getSongById
} = require('../controllers/songcontrollers.js');

// GET /api/songs
router.get('/', getAllSongs);

// GET /api/songs/:id
router.get('/:id', getSongById);

module.exports = router;