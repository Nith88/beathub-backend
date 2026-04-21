# BeatHub Index Strategy

## Phase 1: Query Pattern Identification

| ID | Description | Collection | Filter (Equality) | Sort | Range ($gt/$lt) |
|----|-------------|------------|-------------------|------|-----------------|
| Q1 | Electronic Songs by Duration | Songs | `genre` | `duration` | - |
| Q2 | Recent Songs by Year | Songs | - | `releaseYear` | `releaseYear` |
| Q3 | User Playlists | Playlists | `user` | - | - |
| Q4 | Artist Songs by Popularity | Songs | `artist` | `plays` | - |
| Q5 | High Activity Users | Users | - | - | `loginCount` |

## Phase 2: Index Design & Justification

### Query 1: Electronic Songs by Duration
*   **ESR:** Equality (genre) → Sort (duration)
*   **Proposed Index:** `{ genre: 1, duration: -1 }`
*   **Rationale:** Optimized for filtering by genre first, then utilizing pre-sorted duration data.

### Query 2: Recent Songs by Year
*   **ESR:** Sort/Range (releaseYear)
*   **Proposed Index:** `{ releaseYear: -1 }`
*   **Rationale:** Single field handles both the range filter and the sort order.

### Query 3: User Playlists
*   **ESR:** Equality (user)
*   **Proposed Index:** `{ user: 1 }`
*   **Rationale:** Standard foreign key index for fast relationship lookups.

### Query 4: Artist Songs by Popularity
*   **ESR:** Equality (artist) → Sort (plays)
*   **Proposed Index:** `{ artist: 1, plays: -1 }`
*   **Rationale:** Compound index ensures songs are retrieved in correct popularity order without in-memory sorting.

### Query 5: High Activity Users
*   **ESR:** Range (loginCount)
*   **Proposed Index:** `{ loginCount: 1 }`
*   **Rationale:** Allows efficient range scanning for analytic queries.

## Phase 3: Performance Validation

### Query 1: Electronic Songs by Duration
- **Before:** Stage: COLLSCAN | Docs Examined: 2000 | Time: 4ms  
- **After:** Stage: IXSCAN | Docs Examined: ~280 | Time: ~0–1ms  
- **Impact:** ~86% reduction in scanned documents.

---

### Query 2: Recent Songs by Year
- **Before:** Stage: COLLSCAN | Docs Examined: 2000  
- **After:** Stage: IXSCAN | Docs Examined: ~500  
- **Impact:** Efficient range scan; sorting eliminated.

---

### Query 3: User Playlists
- **Before:** Stage: COLLSCAN | Docs Examined: 400  
- **After:** Stage: IXSCAN | Docs Examined: 5  
- **Impact:** Near-perfect efficiency (1:1 scan-to-return ratio).

## Phase 4: Index Risk & Trade-Off Analysis

### 1. How do these indexes impact write performance?
Each insert or update now requires updating multiple indexes. For example, inserting a new song must update indexes on `genre`, `artist`, `plays`, and `releaseYear`. This increases write latency slightly, especially for high-throughput collections.

---

### 2. Are we over-indexing?
No. Each index maps to a critical query pattern. Redundant indexes (like `{ genre: 1 }`) were avoided due to the prefix rule. Compound indexes already cover those use cases efficiently.

---

### 3. Which index is most critical to application survival?
`{ genre: 1, duration: -1 }` is most critical. The “Trending Songs” or filtered browsing experience depends on it. Without this index, the system would perform full collection scans and in-memory sorting under heavy traffic, causing severe latency.

---

### 4. Which index would you remove first if RAM became expensive?
`{ loginCount: 1 }` would be removed first. While useful for analytics, it is not part of core user-facing flows. Removing it reduces memory usage with minimal impact on critical operations.