const express = require('express');
const router = express.Router();

// Import Models
const Song = require('../models/Song');
const Playlist = require('../models/Playlist');

// Import Pipelines
const topArtistsPipeline = require('../aggregations/top-artists');
const userActivityPipeline = require('../aggregations/user-activity');

/**
 * @swagger
 * /analytics/top-artists:
 *   get:
 *     summary: Get Top 5 Artists
 *     description: Returns the top 5 artists ranked by the total number of songs they have on the platform.
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: A sorted list of top artists with their song counts.
 *       500:
 *         description: Server error
 */
router.get('/top-artists', async (req, res) => {
  try {
    // Execute the pipeline on the Song model
    const results = await Song.aggregate(topArtistsPipeline);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Aggregation Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch top artists" });
  }
});

/**
 * @swagger
 * /analytics/most-active-users:
 *   get:
 *     summary: Get Most Active Users
 *     description: Returns the top 5 users ranked by the total number of playlists they have created.
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: A sorted list of highly active users.
 *       500:
 *         description: Server error
 */
router.get('/most-active-users', async (req, res) => {
  try {
    // Execute the pipeline on the Playlist model
    const results = await Playlist.aggregate(userActivityPipeline);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Aggregation Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch active users" });
  }
});

module.exports = router;