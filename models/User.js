const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
{
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

    // --- NEW FIELD START ---
  role: {
    type: String,
    enum: ['user', 'admin'], // We restrict values to only these two
    default: 'user'          // Everyone starts as a regular user
  },
  // --- NEW FIELD END ---

  likedSongs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song"
    }
  ],

  loginCount: {
    type: Number,
    default: 0
  }
},
{
  timestamps: true
}
);


module.exports = mongoose.model('User', userSchema);