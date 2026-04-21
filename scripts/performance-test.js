require('dotenv').config();
const mongoose = require('mongoose');
const Song = require('../models/Song');
const Playlist = require('../models/Playlist');
const User = require('../models/User');

async function runTests() {
  await mongoose.connect(process.env.MONGO_URI);

  console.log('\n1️⃣ Find Electronic songs sorted by duration');
  await Song.find({ genre: 'Electronic' })
    .sort({ duration: -1 });

  console.log('Query 1 executed');

  console.log('\n2️⃣ Find songs released after 2015 sorted by releaseYear');
  await Song.find({ releaseYear: { $gt: 2015 } })
    .sort({ releaseYear: -1 });

  console.log('Query 2 executed');

  console.log('\n3️⃣ Find playlists by random user');
  const playlist = await Playlist.findOne();
  await Playlist.find({ user: playlist.user });

  console.log('Query 3 executed');
    console.log('\n4. Find songs by Artist sorted by Plays');
  // Pattern: Equality (Artist) + Sort (Plays)
  // We fetch a random song first to get a valid Artist ID
  const randomSong = await Song.findOne();
  if (randomSong) {
    await Song.find({ artist: randomSong.artist })
      .sort({ plays: -1 });
  }
  console.log('Query 4 executed');

  console.log('\n5. Find highly active Users');
  // Pattern: Range Query (Login Count > 100)
  await User.find({ loginCount: { $gt: 100 } });
  console.log('Query 5 executed');

  process.exit(0);
}

runTests();