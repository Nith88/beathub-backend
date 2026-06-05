# BeatHub API - Postman Collection Quick Reference

## Collection Overview

| Category | Requests | Purpose |
|----------|----------|---------|
| **Auth** | 3 | User registration, login, error handling |
| **Songs** | 7 | CRUD operations + validation |
| **Pagination** | 5 | Offset & cursor-based pagination |
| **Analytics** | 3 | Top artists, active users, authorization tests |
| **Artists** | 1 | Create artist (prep for songs) |
| **Albums** | 1 | Create album (prep for songs) |

---

## Environment Variables

```json
{
  "base_url": "http://localhost:3000",
  "auth_token": "",          // Auto-filled after login
  "user_id": "",             // Auto-filled after login
  "song_id": "",             // Auto-filled after create song
  "artist_id": "",           // Auto-filled after create artist
  "album_id": "",            // Auto-filled after create album
  "next_cursor": ""          // Auto-filled by cursor pagination
}
```

---

## Request Summary Table

| Method | Endpoint | Auth | Admin | Purpose |
|--------|----------|------|-------|---------|
| POST | `/auth/register` | ❌ | ❌ | Register new user |
| POST | `/auth/login` | ❌ | ❌ | Get JWT token |
| POST | `/songs` | ❌ | ❌ | Create song |
| GET | `/songs` | ❌ | ❌ | Get all songs |
| GET | `/songs/:id` | ❌ | ❌ | Get song by ID |
| PATCH | `/songs/:id` | ❌ | ❌ | Update song |
| DELETE | `/songs/:id` | ❌ | ❌ | Delete song |
| GET | `/song?page=1&limit=10` | ❌ | ❌ | Paginated songs |
| GET | `/song/cursor?limit=5` | ❌ | ❌ | Cursor pagination |
| GET | `/analytics/top-artists` | ✅ | ❌ | Top artists by songs |
| GET | `/analytics/most-active-users` | ✅ | ✅ | Most active users |

---

## Response Status Codes

```
✅ 200 OK               - Successful GET/PATCH/POST (general)
✅ 201 Created          - Successful resource creation
✅ 204 No Content       - Successful DELETE
❌ 400 Bad Request      - Invalid input/format
❌ 401 Unauthorized     - Missing/invalid auth token
❌ 403 Forbidden        - Insufficient permissions (admin required)
❌ 404 Not Found        - Resource doesn't exist
❌ 500 Server Error     - Server/database error
```

---

## Database Schema Summary

### User
- `username` (string, unique)
- `email` (string, unique)
- `password` (string, hashed with bcryptjs)
- `role` (enum: 'user' | 'admin')
- `likedSongs` (array of Song ObjectIds)
- `loginCount` (number)

### Song
- `title` (string)
- `duration` (number, in seconds)
- `artist` (ObjectId → Artist)
- `album` (ObjectId → Album)
- `genre` (enum: 'Pop'|'Rock'|'Hip Hop'|'Jazz'|'Electronic')
- `releaseYear` (number, YYYY)
- `plays` (number, default: 0)

### Artist
- `name` (string)
- `genre` (enum: 'Pop'|'Rock'|'Hip Hop'|'Jazz'|'Electronic')
- `followers` (number)
- `socialLinks` { twitter, instagram }
- `albums` (array of Album ObjectIds)
- `songs` (array of Song ObjectIds)

### Album
- `title` (string)
- `releaseYear` (number)
- `artist` (ObjectId → Artist)

### Playlist
- `name` (string)
- `user` (ObjectId → User)
- `songs` (array of Song ObjectIds)

---

## Data Flow Diagram

```
REGISTRATION/LOGIN
├─ POST /auth/register
│  ├─ Validates user doesn't exist
│  ├─ Hashes password with bcryptjs
│  └─ Creates User document
│
└─ POST /auth/login
   ├─ Finds user by email
   ├─ Compares password (bcrypt)
   ├─ Generates JWT token
   ├─ Increments loginCount
   └─ Returns token + user data

SONG OPERATIONS
├─ POST /songs
│  ├─ Validates all required fields
│  ├─ References Artist and Album by ObjectId
│  ├─ Validates genre enum
│  └─ Creates Song document
│
├─ GET /songs
│  └─ Returns all songs (or paginated)
│
├─ GET /songs/:id
│  ├─ Validates ObjectId format
│  └─ Retrieves single song
│
├─ PATCH /songs/:id
│  ├─ Validates ObjectId format
│  ├─ Updates specified fields
│  ├─ Runs schema validators
│  └─ Returns updated document
│
└─ DELETE /songs/:id
   ├─ Validates ObjectId format
   └─ Removes document

PAGINATION
├─ GET /song?page=N&limit=M (Offset)
│  ├─ Calculates skip: (page-1)*limit
│  ├─ Counts total documents
│  ├─ Returns metadata + data
│  └─ Includes hasNext/hasPrev flags
│
└─ GET /song/cursor?limit=M (Cursor)
   ├─ Decodes cursor to ObjectId
   ├─ Queries: _id < cursor
   ├─ Sorts by _id descending
   ├─ Encodes next cursor
   └─ Includes hasMore flag

ANALYTICS
├─ GET /analytics/top-artists (Auth required)
│  ├─ Authenticates JWT token
│  ├─ Aggregates Songs collection
│  │  ├─ Groups by artist
│  │  ├─ Counts songs per artist
│  │  ├─ Sorts by count descending
│  │  └─ Limits to top 5
│  └─ Returns results
│
└─ GET /analytics/most-active-users (Auth + Admin required)
   ├─ Authenticates JWT token
   ├─ Checks user role === 'admin'
   ├─ Aggregates Playlists collection
   │  ├─ Groups by user
   │  ├─ Counts playlists per user
   │  ├─ Sorts by count descending
   │  └─ Limits to top 5
   └─ Returns results
```

---

## Authentication Flow

```
1. User Registers
   POST /auth/register
   { username, email, password }
   ↓
2. Password Hashed (bcryptjs)
   ↓
3. User Document Created
   ↓
4. User Logs In
   POST /auth/login
   { email, password }
   ↓
5. Password Verified (bcrypt.compare)
   ↓
6. JWT Token Generated
   sign({ id, username }, JWT_SECRET, { expiresIn: '1h' })
   ↓
7. loginCount Incremented
   ↓
8. Token Sent to Client
   ↓
9. Client Includes Token in Future Requests
   Authorization: Bearer <token>
   ↓
10. Authenticate Middleware Verifies Token
    jwt.verify(token, JWT_SECRET)
    ↓
11. User Document Fetched & Attached to Request
    req.user = { _id, email, role, ... }
```

---

## Authorization Flow

```
Public Endpoints (No Auth)
├─ POST /auth/register
├─ POST /auth/login
├─ GET /songs
├─ GET /songs/:id
├─ PATCH /songs/:id
├─ DELETE /songs/:id
├─ GET /song (paginated)
└─ GET /song/cursor

Authenticated Endpoints (Token Required)
├─ GET /analytics/top-artists
│  ├─ Middleware: authenticate
│  └─ Anyone with valid token can access
│
└─ Admin-Only Endpoints
   └─ GET /analytics/most-active-users
      ├─ Middleware: authenticate
      ├─ Middleware: authorize('admin')
      └─ Only users with role='admin' can access
```

---

## Cursor Pagination Logic

```javascript
// First Request (no cursor)
GET /song/cursor?limit=5

// Response
{
  data: [ song1, song2, song3, song4, song5 ],
  pagination: {
    nextCursor: "base64_encoded_id_of_song5",
    hasMore: true
  }
}

// Next Request (with cursor)
GET /song/cursor?cursor=base64_encoded_id_of_song5&limit=5

// Database Query Behind the Scenes
db.collection('songs').find({ _id: { $lt: ObjectId(cursor) } })
  .sort({ _id: -1 })
  .limit(5)

// Benefits
- O(1) performance (no offset calculation)
- Stable pagination (handles insertions/deletions)
- Efficient for large datasets
```

---

## Offset Pagination Logic

```javascript
// Request
GET /song?page=2&limit=10

// Behind the Scenes
skip = (2 - 1) * 10 = 10
totalDocuments = 50 (example)

// Database Query
db.collection('songs').find()
  .sort({ createdAt: -1 })
  .skip(10)
  .limit(10)

// Response Metadata
{
  metadata: {
    currentPage: 2,
    totalPages: 5,
    totalDocuments: 50,
    hasNext: true,      // 2 < 5
    hasPrev: true       // 2 > 1
  }
}

// Benefits
- User can jump to specific page
- Know total pages upfront
- Simple pagination controls

// Drawbacks
- Performance degrades with large offsets
- Inconsistent with concurrent insertions
```

---

## Aggregation Pipeline Examples

### Top Artists Pipeline
```javascript
[
  {
    $group: {
      _id: "$artist",
      songCount: { $sum: 1 }
    }
  },
  {
    $sort: { songCount: -1 }
  },
  {
    $limit: 5
  }
]
```

### Most Active Users Pipeline
```javascript
[
  {
    $group: {
      _id: "$user",
      playlistCount: { $sum: 1 }
    }
  },
  {
    $sort: { playlistCount: -1 }
  },
  {
    $limit: 5
  }
]
```

---

## Test Execution Tips

### Run All Tests
1. Right-click collection → "Run collection"
2. Postman test runner opens
3. Requests execute in order
4. View results and logs

### Run Individual Folder
1. Right-click folder (e.g., "Songs")
2. "Run folder"
3. Only tests in that folder execute

### Run Single Request
1. Click request name
2. Click "Send"
3. View response in "Body" tab

### View Test Results
1. Click "Tests" tab (after sending request)
2. See passed ✓ and failed ✗ assertions

### Debug Failed Tests
1. Click "Console" in Postman footer
2. See console.log outputs from test scripts
3. Check network "Headers" and "Body" tabs

---

## Data Seeding Tips

For testing aggregations with real data:

1. **Create Multiple Artists** via POST /api/artists
2. **Create Multiple Albums** via POST /api/albums
3. **Create Songs** referencing these artists/albums
4. **Run Analytics** endpoints to see aggregation results

---

## Performance Considerations

### Pagination
- **Offset**: Best for small result sets (< 10k documents)
- **Cursor**: Best for large result sets (> 10k documents)

### Aggregations
- Ensure indexed fields: `artist`, `user`
- Group stage should come early in pipeline
- Use `$limit` at end to reduce results

### Authentication
- JWT tokens cached in environment
- Token expires after 1 hour (configure in code)
- Re-login to get new token

---

## Common Postman Features

### Environment Variables
- Use `{{variable_name}}` in requests
- Auto-filled by test scripts
- Manual override in "Environment" settings

### Test Scripts
- Run after response received
- Use `pm.test()` for assertions
- Use `pm.environment.set()` to save variables
- Access response: `pm.response.json()`

### Pre-request Scripts
- Run before sending request
- Setup data, calculate values
- Set headers dynamically

### Collection Variables
- Defined at collection level
- Available in all requests
- Pre-populated with defaults

---

## File Locations

```
beathub-backend/
├─ BeatHub_API_Tests.postman_collection.json    ← Import this
├─ POSTMAN_COLLECTION_GUIDE.md                  ← Full guide
├─ POSTMAN_QUICK_REFERENCE.md                   ← This file
├─ routes/
│  ├─ auth.js                                    (Login/Register)
│  ├─ songroutes.js                              (Song CRUD)
│  ├─ analytics.js                               (Analytics)
│  └─ songs.js                                   (Pagination)
├─ controllers/
│  ├─ authcontroller.js                          (Auth logic)
│  ├─ songcontrollers.js                         (Song CRUD logic)
│  └─ songcontroller.js                          (Pagination logic)
├─ middleware/
│  ├─ authenticate.js                            (JWT verification)
│  └─ authorize.js                               (Role checking)
└─ models/
   ├─ User.js
   ├─ Song.js
   ├─ Artist.js
   ├─ Album.js
   └─ Playlist.js
```

---

## Next Steps

1. ✅ Import collection into Postman
2. ✅ Set `base_url` to your server address
3. ✅ Run Auth tests (Register → Login)
4. ✅ Run Song tests (Create → Read → Update → Delete)
5. ✅ Run Pagination tests
6. ✅ Run Analytics tests (with valid JWT token)
7. 📊 Review test results and logs
8. 🐛 Debug any failures
9. 📝 Document findings
10. 🚀 Integrate into CI/CD pipeline

