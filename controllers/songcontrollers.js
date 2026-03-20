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
// PATCH - Update song
const updateSong = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Song ID" });
  }

  try {
    const updatedSong = await Song.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,          // return updated doc
        runValidators: true // enforce schema rules
      }
    );

    if (!updatedSong) {
      return res.status(404).json({ message: "Song not found" });
    }

    return res.status(200).json({
      success: true,
      data: updatedSong
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Server Error" });
  }
};

// DELETE → Remove Song
const deleteSong = async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Song ID" });
  }

  try {
    const deletedSong = await Song.findByIdAndDelete(id);

    if (!deletedSong) {
      return res.status(404).json({ message: "Song not found" });
    }

    return res.status(204).send();

  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getAllSongs,
  getSongById,
  updateSong,
  deleteSong
};