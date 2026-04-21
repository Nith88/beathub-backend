// routes/songsRoutes.js

const express = require('express');
const router = express.Router();

const {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong
} = require('../controllers/songcontrollers.js');

// GET /api/songs
router.get('/', getAllSongs);

// GET /api/songs/:id
router.get('/:id', getSongById);

// POST /api/songs
router.post('/', createSong);

// PATCH /api/songs/:id
router.patch('/:id', updateSong);

// DELETE /api/songs/:id
router.delete('/:id', deleteSong);

module.exports = router;