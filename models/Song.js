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
  }
},
{
  timestamps: true
}
);

module.exports = mongoose.model("Song", songSchema);