const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true,
    trim: true
  },

  duration: {
    type: Number,
    required: true
  },

  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artist",
    required: true
  },

  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album",
    required: true
  },

  genre: {
    type: String,
    required: true,
    enum: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Electronic']
  },

  releaseYear: {
    type: Number,
    required: true
  },

  plays: {
    type: Number,
    default: 0
  }
},
{
  timestamps: true
}
);

module.exports = mongoose.model("Song", songSchema);