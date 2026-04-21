require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Artist = require('../models/Artists');
const Album = require('../models/Album');
const Song = require('../models/Song');
const User = require('../models/User');
const Playlist = require('../models/Playlist');

const genres = ['Pop', 'Rock', 'Electronic', 'Hip Hop', 'Jazz'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      Artist.deleteMany({}),
      Album.deleteMany({}),
      Song.deleteMany({}),
      User.deleteMany({}),
      Playlist.deleteMany({})
    ]);

    console.log('Old data cleared');

    // 1️⃣ Artists
    const artistData = [];
    for (let i = 0; i < 30; i++) {
      artistData.push({
        name: `Artist_${i}`,
        genre: randomItem(genres),
        bio: `Bio for artist ${i}`
      });
    }
    const artists = await Artist.insertMany(artistData);

    // 2️⃣ Albums
    const albumData = [];
    for (let i = 0; i < 100; i++) {
      albumData.push({
        title: `Album_${i}`,
        releaseYear: 2000 + (i % 24),
        artist: randomItem(artists)._id
      });
    }
    const albums = await Album.insertMany(albumData);

    // 3️⃣ Songs
    const songData = [];
    for (let i = 0; i < 2000; i++) {
      songData.push({
        title: `Song_${i}`,
        duration: Math.floor(Math.random() * 400),
        genre: randomItem(genres),
        releaseYear: 2000 + (i % 24),
        artist: randomItem(artists)._id,
        album: randomItem(albums)._id
      });
    }
    const songs = await Song.insertMany(songData);

    // 4️⃣ Users
    const userData = [];
    const salt = await bcrypt.genSalt(10);
    for (let i = 0; i < 200; i++) {
      const hashedPassword = await bcrypt.hash('password123', salt);
      userData.push({
        username: `user_${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
        loginCount: Math.floor(Math.random() * 100)
      });
    }
    const users = await User.insertMany(userData);

    // 5️⃣ Playlists
    const playlistData = [];
    for (let i = 0; i < 400; i++) {
      const randomSongs = [];
      for (let j = 0; j < 15; j++) {
        randomSongs.push(randomItem(songs)._id);
      }

      playlistData.push({
        name: `Playlist_${i}`,
        description: 'Auto generated playlist',
        user: randomItem(users)._id,
        songs: randomSongs
      });
    }

    await Playlist.insertMany(playlistData);

    console.log('Database seeded successfully!');
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();