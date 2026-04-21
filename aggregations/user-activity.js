// aggregations/user-activity.js

/**
 * Pipeline to find the top 5 most active users based on playlist creation.
 * Target Collection: Playlists
 */
const userActivityPipeline = [
  // Stage 1: Group playlists by the 'user' ID and count them
  {
    $group: {
      _id: "$user",
      playlistCount: { $sum: 1 }
    }
  },
  // Stage 2: Sort highest to lowest
  {
    $sort: { playlistCount: -1 }
  },
  // Stage 3: Keep only the top 5
  {
    $limit: 5
  },
  // Stage 4: JOIN with the Users collection to get user details
  {
    $lookup: {
      from: "users",           // Target collection
      localField: "_id",       // The user ID from our $group stage
      foreignField: "_id",     // The _id in the users collection
      as: "userDetails"
    }
  },
  // Stage 5: Format the final output
  {
    $project: {
      _id: 0,
      userId: "$_id",
      playlistCount: 1,
      username: { $arrayElemAt: ["$userDetails.username", 0] },
      email: { $arrayElemAt: ["$userDetails.email", 0] }
    }
  }
];

module.exports = userActivityPipeline;