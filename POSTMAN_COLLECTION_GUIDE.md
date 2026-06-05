# BeatHub Backend API - Postman Collection Documentation

## Overview

This Postman collection provides comprehensive testing coverage for the BeatHub backend API, including:
- **Authentication** (Registration & Login)
- **Song CRUD Operations** (Create, Read, Update, Delete)
- **Pagination** (Offset-based and Cursor-based)
- **Analytics** (Top Artists, Most Active Users)
- **Authorization** (Admin-only endpoints)

## Quick Start

### 1. Import the Collection
1. Open Postman
2. Click `Import` → Select `BeatHub_API_Tests.postman_collection.json`
3. The collection will be imported with all requests organized in folders

### 2. Set Environment Variables
The collection uses variables that need to be configured:

- **base_url**: Default is `http://localhost:3000` (adjust if your server runs on a different port)
- **auth_token**: Automatically set after successful login
- **song_id**: Automatically set after creating a song
- **artist_id**: Automatically set after creating an artist
- **album_id**: Automatically set after creating an album
- **next_cursor**: Automatically set when using cursor pagination

You can edit these in Postman's Environment settings.

### 3. Run the Collection
Start with the requests in this order:

1. **Register User** → Creates a new test user
2. **Login User** → Gets JWT token (automatically saved)
3. **Create Song** → Creates a test song (need artist and album IDs first)
4. **Get All Songs** → Verify song creation
5. **Other operations** → Test remaining endpoints

---

## API Endpoint Details

### Authentication Routes

#### POST `/api/auth/register`
**Purpose**: Register a new user

**Request Body**:
```json
{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "TestPassword123!"
}
```

**Database Logic**:
- Checks if user already exists (by email or username)
- Hashes password using bcryptjs with salt of 10
- Creates new User document with role defaulting to "user"
- Saves to User collection

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

**Test Validations**:
- ✅ Status code is 201
- ✅ Response indicates success
- ✅ Proper response structure

---

#### POST `/api/auth/login`
**Purpose**: Authenticate user and receive JWT token

**Request Body**:
```json
{
  "email": "testuser@example.com",
  "password": "TestPassword123!"
}
```

**Database Logic** (from authcontroller.js):
- Finds user by email from User collection
- Compares provided password with hashed password using bcrypt
- Generates JWT token with user ID and username
- Increments user's loginCount field
- Returns token and user data (DTO format)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "testuser",
      "email": "testuser@example.com",
      "role": "user",
      "loginCount": 1
    }
  }
}
```

**Test Validations**:
- ✅ Status code is 200
- ✅ Response contains JWT token
- ✅ User object has username, email, and role
- ✅ Token automatically saved to `auth_token` variable

**Auth Error Test**:
- Tests invalid credentials → Returns 401 Unauthorized

---

### Song Routes

#### POST `/api/songs`
**Purpose**: Create a new song

**Request Body**:
```json
{
  "title": "Blinding Lights",
  "duration": 200,
  "artist": "507f1f77bcf86cd799439011",
  "album": "507f1f77bcf86cd799439012",
  "genre": "Pop",
  "releaseYear": 2020
}
```

**Database Logic** (from songcontrollers.js):
- Validates all required fields
- Creates new Song document with:
  - References to Artist and Album by ObjectId
  - Genre restricted to enum: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Electronic']
  - Initial plays count of 0
  - Timestamps (createdAt, updatedAt)
- Saves to Song collection

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Blinding Lights",
    "duration": 200,
    "artist": "507f1f77bcf86cd799439011",
    "album": "507f1f77bcf86cd799439012",
    "genre": "Pop",
    "releaseYear": 2020,
    "plays": 0,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Test Validations**:
- ✅ Status code is 201
- ✅ Response is successful
- ✅ All required fields are present
- ✅ Default plays count is 0
- ✅ Song ID saved to `song_id` variable

---

#### GET `/api/songs`
**Purpose**: Retrieve all songs

**Response** (200 OK):
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Blinding Lights",
    "duration": 200,
    "artist": "507f1f77bcf86cd799439011",
    "album": "507f1f77bcf86cd799439012",
    "genre": "Pop",
    "releaseYear": 2020,
    "plays": 0,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

**Test Validations**:
- ✅ Status code is 200
- ✅ Response is array
- ✅ Each song has required fields

---

#### GET `/api/songs/:id`
**Purpose**: Get a specific song by ID

**Database Logic**:
- Validates ObjectId format
- Queries Song collection by ID
- Returns populated references if configured

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "title": "Blinding Lights",
  "duration": 200,
  "artist": "507f1f77bcf86cd799439011",
  "album": "507f1f77bcf86cd799439012",
  "genre": "Pop",
  "releaseYear": 2020,
  "plays": 0
}
```

**Error Response** (404 Not Found):
```json
{
  "message": "Song not found"
}
```

**Test Validations**:
- ✅ Status code is 200
- ✅ Returned song matches requested ID
- ✅ All fields are present

**Invalid ID Test**:
- Tests with invalid format → Returns 400 Bad Request

---

#### PATCH `/api/songs/:id`
**Purpose**: Update a song

**Request Body** (partial update):
```json
{
  "title": "Blinding Lights (Remix)",
  "duration": 210
}
```

**Database Logic**:
- Validates ObjectId format
- Uses `findByIdAndUpdate()` with:
  - `new: true` → returns updated document
  - `runValidators: true` → enforces schema validation
- Only updates provided fields
- Maintains timestamps

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Blinding Lights (Remix)",
    "duration": 210,
    "artist": "507f1f77bcf86cd799439011",
    "album": "507f1f77bcf86cd799439012",
    "genre": "Pop",
    "releaseYear": 2020,
    "plays": 0,
    "updatedAt": "2024-01-15T10:35:00Z"
  }
}
```

**Test Validations**:
- ✅ Status code is 200
- ✅ Updated values are correct
- ✅ Other fields unchanged

---

#### DELETE `/api/songs/:id`
**Purpose**: Delete a song

**Database Logic**:
- Validates ObjectId format
- Calls `findByIdAndDelete()`
- Removes document from Song collection

**Response** (204 No Content):
- Empty response body

**Test Validations**:
- ✅ Status code is 204
- ✅ Response body is empty

**Verification Test**:
- Attempts to GET deleted song → Returns 404

---

### Pagination Routes

#### GET `/api/song?page=1&limit=10`
**Purpose**: Get songs with offset-based pagination

**Database Logic** (from songcontroller.js):
```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;
const totalDocuments = await Song.countDocuments();
const songs = await Song.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
```

**Response** (200 OK):
```json
{
  "metadata": {
    "currentPage": 1,
    "totalPages": 5,
    "totalDocuments": 50,
    "hasNext": true,
    "hasPrev": false
  },
  "data": [
    { /* song objects */ }
  ]
}
```

**Query Parameters**:
- `page` (default: 1) - Page number to fetch
- `limit` (default: 10) - Items per page

**Test Validations**:
- ✅ Metadata contains pagination info
- ✅ hasPrev/hasNext values correct
- ✅ Respects page and limit parameters

**Tests Included**:
- Page 1 (hasPrev should be false)
- Page 2 (hasPrev should be true)
- Custom limit (5 items per page)

---

#### GET `/api/song/cursor?limit=5`
**Purpose**: Get songs using cursor-based pagination

**Database Logic** (from songcontroller.js):
```javascript
const limit = Math.min(parseInt(req.query.limit) || 10, 100);
const encodedCursor = req.query.cursor;
let cursor = null;

if (encodedCursor) {
  cursor = decodeCursor(encodedCursor); // Converts base64 to ObjectId
}

const query = cursor ? { _id: { $lt: cursor } } : {};
const songs = await Song.find(query)
  .sort({ _id: -1 })
  .limit(limit + 1)
  .lean();

const hasMore = songs.length > limit;
if (hasMore) songs.pop();

const nextCursor = hasMore && songs.length > 0 
  ? encodeCursor(songs[songs.length - 1]._id)
  : null;
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [ /* song objects */ ],
  "pagination": {
    "nextCursor": "NjBmZjM3YzZjM2ZmZWU0YzI0MjRlODUw",
    "hasMore": true,
    "limit": 5,
    "count": 5
  }
}
```

**Query Parameters**:
- `cursor` (optional) - Base64 encoded cursor for next page
- `limit` (default: 10, max: 100) - Items per page

**Performance Benefits**:
- Better for large datasets (doesn't calculate offset)
- Efficient sorting by ObjectId
- Prevents SKIP/LIMIT offset problems

**Test Validations**:
- ✅ Cursor pagination structure present
- ✅ nextCursor automatically saved for next request
- ✅ hasMore flag indicates if more data available

---

### Analytics Routes

#### GET `/api/analytics/top-artists`
**Purpose**: Get top 5 artists ranked by song count

**Requirements**:
- ✅ Authentication required (Bearer token)
- ❌ Authorization: Any authenticated user can access

**Request Header**:
```
Authorization: Bearer {{auth_token}}
```

**Database Logic** (from analytics.js):
```javascript
const topArtistsPipeline = require('../aggregations/top-artists');
const results = await Song.aggregate(topArtistsPipeline);
```

**Aggregation Pipeline**:
1. Groups songs by artist
2. Counts songs per artist
3. Sorts by count descending
4. Limits to top 5 results

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "artistName": "The Weeknd",
      "songCount": 12
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "artistName": "Drake",
      "songCount": 10
    }
  ]
}
```

**Error Responses**:
- **401 Unauthorized** - No token or invalid token
- **500 Server Error** - Aggregation failure

**Test Validations**:
- ✅ Status code is 200
- ✅ Data is sorted by song count (descending)
- ✅ Array structure is correct

**Error Test**:
- Tests without auth header → Returns 401

---

#### GET `/api/analytics/most-active-users`
**Purpose**: Get top 5 most active users ranked by playlist count

**Requirements**:
- ✅ Authentication required (Bearer token)
- ✅ Authorization required: `admin` role only

**Request Header**:
```
Authorization: Bearer {{auth_token}}
```

**Database Logic** (from analytics.js):
```javascript
const userActivityPipeline = require('../aggregations/user-activity');
const results = await Playlist.aggregate(userActivityPipeline);
```

**Aggregation Pipeline**:
1. Groups playlists by user
2. Counts playlists per user
3. Sorts by count descending
4. Limits to top 5 results

**Response** (200 OK - Admin Only):
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "userName": "musiclover123",
      "playlistCount": 25
    }
  ]
}
```

**Error Responses**:
- **401 Unauthorized** - No token or invalid token
- **403 Forbidden** - User doesn't have admin role
- **500 Server Error** - Aggregation failure

**Test Validations**:
- ✅ Status code is 200 (admin) or 403 (non-admin)
- ✅ Authorization properly enforced
- ✅ Error message includes "admin"

---

## Model Structure Overview

### User Model
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  likedSongs: [ObjectId] (refs to Song),
  loginCount: Number (default: 0),
  createdAt: Date (timestamp),
  updatedAt: Date (timestamp)
}
```

### Song Model
```javascript
{
  title: String (required),
  duration: Number (required),
  artist: ObjectId (ref to Artist, required),
  album: ObjectId (ref to Album, required),
  genre: String (enum: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Electronic']),
  releaseYear: Number (required),
  plays: Number (default: 0),
  createdAt: Date (timestamp),
  updatedAt: Date (timestamp)
}
```

### Artist Model
```javascript
{
  name: String (required),
  genre: String (enum: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Electronic']),
  followers: Number (default: 0),
  socialLinks: {
    twitter: String,
    instagram: String
  },
  albums: [ObjectId] (refs to Album),
  songs: [ObjectId] (refs to Song),
  createdAt: Date (timestamp),
  updatedAt: Date (timestamp)
}
```

### Album Model
```javascript
{
  title: String (required),
  releaseYear: Number (required),
  artist: ObjectId (ref to Artist, required),
  createdAt: Date (timestamp),
  updatedAt: Date (timestamp)
}
```

### Playlist Model
```javascript
{
  name: String (required),
  user: ObjectId (ref to User, required),
  songs: [ObjectId] (refs to Song),
  createdAt: Date (timestamp),
  updatedAt: Date (timestamp)
}
```

---

## Middleware Explanation

### Authenticate Middleware
Located in `middleware/authenticate.js`

**Flow**:
1. Extracts JWT token from `Authorization: Bearer <token>` header
2. Returns 401 if no token provided
3. Verifies token using JWT_SECRET environment variable
4. Fetches complete user document from database
5. Attaches user to request object (`req.user`)
6. Calls next() to proceed

**Usage**: Required for `/api/analytics/top-artists` and `/api/analytics/most-active-users`

### Authorize Middleware
Located in `middleware/authorize.js`

**Flow**:
1. Checks user's role (set by authenticate middleware)
2. Validates against required role (e.g., 'admin')
3. Returns 403 if user doesn't have required role
4. Calls next() if authorized

**Usage**: Required for `/api/analytics/most-active-users` (admin only)

---

## Test Workflow

### Recommended Test Sequence

1. **Register User**
   - Creates test user with unique timestamp-based email
   - Validates success response

2. **Login User**
   - Uses registered credentials
   - Saves JWT token to `auth_token` environment variable
   - Token valid for 1 hour

3. **Create Song**
   - Requires valid artist and album IDs
   - May need to create these first (endpoints may not exist in current API)
   - Saves song_id for future operations

4. **Get All Songs**
   - Verifies song was created
   - No auth required

5. **Get Song By ID**
   - Tests specific song retrieval
   - Validates returned data matches sent data

6. **Update Song**
   - Modifies song title and duration
   - Verifies changes persisted

7. **Delete Song**
   - Removes song from database
   - Verifies with follow-up GET (should return 404)

8. **Pagination Tests**
   - Tests offset-based pagination with various page/limit combinations
   - Tests cursor-based pagination

9. **Analytics Tests**
   - Tests top artists (requires auth)
   - Tests active users (requires admin auth)

---

## Environment Setup

### Prerequisites
- Node.js and npm installed
- MongoDB running locally or connection string configured
- Environment variables set (.env file):
  ```
  MONGO_URI=mongodb://127.0.0.1:27017/beathub_test
  JWT_SECRET=your-secret-key
  PORT=3000
  ```

### Running the Server
```bash
npm install
npm start
```

Server runs on `http://localhost:3000`

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 401 Unauthorized on analytics | Ensure login request was run first and token is valid |
| 400 Invalid song ID | Song ID must be valid MongoDB ObjectId format |
| 403 Forbidden on most-active-users | Current user must have `admin` role in database |
| 404 Song not found | Verify song exists or was not deleted |
| 500 Server Error | Check MongoDB connection and server logs |

---

## Notes

- **Token Expiration**: JWT tokens expire after 1 hour, need to login again
- **Data Relationships**: Songs reference Artist and Album by ObjectId - ensure these exist before creating songs
- **Cursor Pagination**: More efficient for large datasets, uses ObjectId sorting
- **Genre Validation**: Only specific genres allowed (Pop, Rock, Hip Hop, Jazz, Electronic)
- **Timestamps**: All models include automatic createdAt and updatedAt fields
- **Role-Based Access**: Admin role required for certain analytics endpoints

