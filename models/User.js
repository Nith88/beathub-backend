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

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);