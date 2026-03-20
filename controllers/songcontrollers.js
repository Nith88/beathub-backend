// controllers/songsController.js

const Song = require('../models/Song');
const mongoose = require('mongoose');

// GET all songs
const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find();
    return res.status(200).json(songs);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' });
  }
};

// GET song by ID
const getSongById = async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid song ID format' });
  }

  try {
    const song = await Song.findById(id);

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    return res.status(200).json(song);

  } catch (error) {
    return res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAllSongs,
  getSongById
};