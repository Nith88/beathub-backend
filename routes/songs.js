const express = require('express');
const router = express.Router();

const { getSongs,getSongsCursor } = require('../controllers/songcontroller.js');

// Define the GET route for songs
router.get('/song', getSongs);
router.get('/song/cursor', getSongsCursor);

module.exports = router;