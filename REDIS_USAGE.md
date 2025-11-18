# Redis Usage in BookConnect

This document explains where and how Redis is used in the BookConnect application.

## Overview

Redis is used for two main purposes:
1. **Session Storage** - Storing user session data
2. **API Response Caching** - Caching frequently accessed API responses

## 1. Session Storage

### Location
- **File**: `server.js` (lines 32-46)
- **Store**: `connect-redis` package with `RedisStore`

### How it works:
```javascript
if (process.env.REDIS_URL) {
  const redisStore = new RedisStore({ client: redisClient });
  sessionOptions.store = redisStore;
}
```

### What's stored:
- User session data (user ID, username, email, isAdmin flag)
- Session expiration: 2 hours (configurable via `cookie.maxAge`)

### Redis Keys Format:
- Session keys follow the pattern: `sess:<session_id>`
- Example: `sess:abc123def456...`

### Fallback:
If `REDIS_URL` is not set, the app falls back to in-memory session storage (not recommended for production).

---

## 2. API Response Caching

### Location
- **File**: `routes/apiRoutes.js`
- **Endpoints**: 
  - `GET /api/reviews` (lines 9-27)
  - `GET /api/books` (lines 32-43)

### How it works:

#### Reviews API (`/api/reviews`):
```javascript
const cacheKey = 'api:reviews:all';
// Check cache first
if (process.env.REDIS_URL && redisClient.isOpen) {
  const cached = await redisClient.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
}
// If not cached, fetch from DB and cache for 60 seconds
await redisClient.setEx(cacheKey, 60, JSON.stringify(reviews));
```

#### Books API (`/api/books`):
```javascript
const cacheKey = 'api:books:all';
// Same pattern: check cache, if miss then fetch and cache
```

### Cache Invalidation:
- **Location**: `controllers/reviewController.js` (line 125-127)
- When a new review is added, the reviews cache is invalidated:
```javascript
if (process.env.REDIS_URL && redisClient.isOpen) {
  await redisClient.del('api:reviews:all');
}
```

### Redis Keys Format:
- `api:reviews:all` - Cached reviews list
- `api:books:all` - Cached books list

### Cache Duration:
- **TTL**: 60 seconds (1 minute)
- After expiration, the next request fetches fresh data from the database

---

## Configuration

### Environment Variables:
```env
REDIS_URL=redis://localhost:6379
# Or for remote Redis:
REDIS_URL=redis://username:password@host:port
```

### Redis Client Setup:
- **File**: `utils/redisClient.js`
- Creates a Redis client using the `redis` package
- Automatically connects when `REDIS_URL` is set

---

## Benefits

1. **Performance**: Reduces database queries for frequently accessed data
2. **Scalability**: Session storage in Redis allows multiple server instances to share sessions
3. **Speed**: Redis is in-memory, providing sub-millisecond response times
4. **Reliability**: Redis persistence options ensure data survives restarts

---

## Monitoring

To check Redis usage:
```bash
# Connect to Redis CLI
redis-cli

# List all keys
KEYS *

# Check session keys
KEYS sess:*

# Check API cache keys
KEYS api:*

# Get cache value
GET api:reviews:all

# Check TTL (time to live)
TTL api:reviews:all
```

---

## Notes

- Redis is **optional** - the app works without it (falls back to in-memory sessions)
- Cache invalidation happens automatically when reviews are added
- Session data is automatically cleaned up after expiration
- For production, always use Redis for session storage to support horizontal scaling

