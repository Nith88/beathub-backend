// aggregations/top-artists.js

/**
 * Pipeline to find the top 5 artists with the most songs.
 * Target Collection: Songs
 */
const topArtistsPipeline = [
  // Stage 1: Group all songs by their 'artist' ID and count them
  {
    $group: {
      _id: "$artist",
      totalSongs: { $sum: 1 }
    }
  },
  // Stage 2: Sort the grouped results by totalSongs in descending order
  {
    $sort: { totalSongs: -1 }
  },
  // Stage 3: Keep only the top 5 results to save memory
  {
    $limit: 5
  },
  // Stage 4: JOIN with the Artists collection to get the artist's name
  {
    $lookup: {
      from: "artists",         // The target collection name in MongoDB (usually pluralized)
      localField: "_id",       // The artist ID from our $group stage
      foreignField: "_id",     // The matching ID in the artists collection
      as: "artistDetails"      // The new array field to store the joined data
    }
  },
  // Stage 5: Clean up the output to make it API-friendly
  {
    $project: {
      _id: 0, // Hide the raw ID
      artistId: "$_id",
      totalSongs: 1,
      artistName: { $arrayElemAt: ["$artistDetails.name", 0] }, // Extract name from the joined array
      genre: { $arrayElemAt: ["$artistDetails.genre", 0] }
    }
  }
];

module.exports = topArtistsPipeline;