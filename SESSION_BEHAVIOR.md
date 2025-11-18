# Understanding Session Storage in Redis

## How Sessions Work

### One Session Per Browser/Device
- **Each browser gets ONE session** when you log in
- If you log out and log back in, you get a **NEW session** and the old one is **destroyed**
- Same browser = same session (until you log out)

### Multiple Sessions = Multiple Users or Devices
You'll see multiple sessions in Redis when:
1. **Multiple users are logged in** (different users from different browsers)
2. **Same user logged in from different browsers** (Chrome, Firefox, Edge, etc.)
3. **Same user logged in from different devices** (laptop, phone, tablet)
4. **Multiple tabs/windows** - Usually share the same session (same cookies)

### Session Lifecycle

```
Login → Create Session → Store in Redis + MongoDB
  ↓
Use Site → Session stays active (2 hours)
  ↓
Logout → Destroy Session → Remove from Redis + MongoDB
```

### Why You Might Only See One Session

If you're only seeing **one session** in Redis, it's because:
- ✅ You're logged in as **one user** in **one browser**
- ✅ This is **normal behavior**!

To see multiple sessions:
1. **Open a different browser** (Chrome, Firefox, Edge)
2. **Log in as a different user** in that browser
3. **Check Redis again** - you'll see 2 sessions now!

### Session Expiration

- Sessions expire after **2 hours** of inactivity
- Expired sessions are automatically removed from Redis
- You can check expiration: `redis-cli TTL sess:<session-id>`

### Testing Multiple Sessions

**Test 1: Multiple Users**
```bash
# Browser 1: Login as user1
# Browser 2: Login as user2
# Check Redis: KEYS sess:*
# Should see 2 sessions
```

**Test 2: Same User, Different Browsers**
```bash
# Chrome: Login as host
# Firefox: Login as host (same user)
# Check Redis: KEYS sess:*
# Should see 2 sessions (one per browser)
```

**Test 3: Logout and Login Again**
```bash
# Login → Creates session1
# Logout → Destroys session1
# Login again → Creates session2 (new session)
# Check Redis: KEYS sess:*
# Should see only session2 (session1 was destroyed)
```

## Viewing All Active Sessions

### In Redis CLI
```bash
redis-cli
KEYS sess:*
# Shows all session keys

GET sess:<session-id>
# View specific session data

TTL sess:<session-id>
# Check time until expiration (in seconds)
```

### In MongoDB
```bash
mongosh
use book_connect
db.sessions.find().pretty()
# Shows all active sessions
```

## Summary

- **One session per browser/device** is normal
- **Multiple sessions = multiple users or devices**
- **Logout destroys the session** (that's why you only see one)
- **Sessions expire after 2 hours** of inactivity
- **This is working correctly!** ✅

