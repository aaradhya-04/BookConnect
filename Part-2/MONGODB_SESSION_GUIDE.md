# MongoDB Session Storage Guide

## Overview

Your application now uses **MongoDB for session storage** alongside Redis. Sessions are stored in both places for redundancy:
- **Redis** (primary) - Fast in-memory storage
- **MongoDB** (backup) - Persistent storage

## How It Works

### Dual Storage System

When a user logs in, their session is saved to:
1. **Redis** - For fast access
2. **MongoDB** - For persistence and backup

If Redis is unavailable, MongoDB is used as the primary store.

### Session Collection

Sessions are stored in MongoDB in the `sessions` collection within your `book_connect` database.

## Viewing Sessions in MongoDB

### Using MongoDB Compass

1. Open **MongoDB Compass**
2. Connect to: `mongodb://localhost:27017`
3. Select database: `book_connect`
4. Click on `sessions` collection
5. You'll see all active sessions

### Using MongoDB Shell (mongosh)

```bash
# Open MongoDB shell
mongosh

# Switch to your database
use book_connect

# View all sessions
db.sessions.find().pretty()

# Count active sessions
db.sessions.countDocuments({ expires: { $gt: new Date() } })

# View a specific session (replace SESSION_ID)
db.sessions.findOne({ _id: "SESSION_ID" })

# View expired sessions
db.sessions.find({ expires: { $lt: new Date() } })

# Delete expired sessions (auto-cleanup happens automatically)
db.sessions.deleteMany({ expires: { $lt: new Date() } })

# Exit
exit
```

## Session Document Structure

Each session document looks like this:

```javascript
{
  _id: "sess:abc123def456...",  // Session ID
  expires: ISODate("2024-01-15T12:00:00Z"),  // Expiration date
  session: "{\"cookie\":{\"originalMaxAge\":7200000,\"expires\":\"2024-01-15T12:00:00.000Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"user\":{\"id\":\"507f1f77bcf86cd799439011\",\"username\":\"john_doe\",\"email\":\"john@example.com\",\"isAdmin\":false}}"
}
```

The `session` field contains a JSON string with:
- Cookie information
- User data (id, username, email, isAdmin flag)

## Automatic Cleanup

MongoDB automatically deletes expired sessions using TTL (Time To Live) indexes. Sessions expire after 2 hours of inactivity (configurable in `server.js`).

## Session Storage Priority

1. **If Redis is available**: Sessions are written to both Redis and MongoDB
2. **If Redis is unavailable**: Sessions are written only to MongoDB
3. **If both unavailable**: Falls back to in-memory storage (not recommended)

## Checking Session Storage

### Verify MongoDB Sessions Are Working

1. **Login to your app**
2. **Check MongoDB**:
   ```bash
   mongosh
   use book_connect
   db.sessions.countDocuments()
   ```
   Should show at least 1 session if you're logged in.

3. **View your session**:
   ```bash
   db.sessions.find().pretty()
   ```

### Verify Dual Storage (Redis + MongoDB)

1. **Check Redis** (if configured):
   ```bash
   redis-cli
   KEYS sess:*
   ```
   Should show session keys.

2. **Check MongoDB**:
   ```bash
   mongosh
   use book_connect
   db.sessions.find().pretty()
   ```
   Should show the same sessions.

## Troubleshooting

### Sessions Not Appearing in MongoDB?

1. **Check MongoDB connection**:
   - Make sure MongoDB is running
   - Check `MONGODB_URI` in `.env` file
   - Verify connection in server logs

2. **Check server logs**:
   - Look for: `✅ MongoDB session store configured`
   - Look for: `✅ Dual storage enabled: Redis (primary) + MongoDB (backup)`

3. **Verify MongoDB connection**:
   ```bash
   node cli/verify-mongodb.js
   ```

### Sessions Expiring Too Quickly?

- Check `cookie.maxAge` in `server.js` (default: 2 hours)
- Sessions expire after the specified time of inactivity

### Can't See Session Data?

- Sessions are stored as JSON strings in the `session` field
- Use MongoDB Compass to view formatted JSON
- Or parse in mongosh: `JSON.parse(db.sessions.findOne().session)`

## Migration from MySQL Sessions

If you had MySQL sessions before:
- Old MySQL sessions are not automatically migrated
- Users will need to log in again
- New sessions will be stored in MongoDB

## Summary

✅ **Sessions are now stored in MongoDB** (and Redis if configured)  
✅ **Automatic cleanup** of expired sessions  
✅ **Persistent storage** - sessions survive server restarts  
✅ **Viewable in MongoDB Compass** or mongosh  

Your sessions are now fully integrated with MongoDB! 🎉

