 BeatHub Design Document

## 1. Data Relationships
*   **Artist:** Parent entity.
*   **Album:** References Artist.
*   **Song:** References Album and Artist.
*   **User:** Independent entity.
*   **Playlist:** References User and contains an array of Song references.

## 2. Design Decisions (Defend Your Code)

**Q: Why did you reference Songs in the Playlist instead of embedding them?**
*   **A:** Songs are referenced rather than embedded because songs are shared resources used across many playlists.

If song data were embedded inside playlists, any update to the song (for example, correcting the title, updating duration, or fixing metadata) would require updating every playlist document that contains that song, which is inefficient and error-prone.

By storing ObjectId references, the playlist only stores the link to the song, not a copy of its data. This ensures:

Data consistency – changes to a song automatically reflect everywhere it is used.

Reduced duplication – the song exists only once in the database.

Better scalability – playlists remain lightweight even when songs are used across thousands of playlists.

This follows the MongoDB best practice of referencing when data is shared across multiple documents.

**Q: Why did you reference the Artist in the Song model?**
*   **A:** Answer:

The Artist is referenced directly in the Song model to optimize query performance and simplify data retrieval.

Although songs already belong to albums (and albums reference artists), querying songs by artist through albums would require multiple database lookups or aggregation pipelines.

By storing the Artist reference directly inside the Song document, common queries become much more efficient. For example:

“Find all songs by a specific artist”

“Show top songs by artist”

“Filter songs by artist genre”

This approach reduces query complexity and improves performance, which is particularly important in music platforms where song-based queries are extremely frequent.

This design is a form of controlled denormalization used to improve read performance while maintaining clear relationships.