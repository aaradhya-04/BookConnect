# How to Test Multiple Sessions in Redis

## Important: Browser Session Behavior

### ⚠️ Same Browser = Same Session

**Tabs in the same browser share the same session cookie!**

- Tab 1: Login as User1 → Creates Session1
- Tab 2 (same browser): Login as User2 → **Overwrites Session1** with User2's data
- Result: Only **1 session** in Redis (with User2's data)

This is **normal browser behavior** - tabs share cookies and session storage.

## ✅ How to See Multiple Sessions

### Method 1: Different Browsers (Recommended)

1. **Chrome**: Login as User1
2. **Firefox**: Login as User2  
3. **Check Redis**: `KEYS sess:*` → Should see **2 sessions**

### Method 2: Incognito/Private Windows

1. **Normal Chrome**: Login as User1
2. **Incognito Chrome**: Login as User2
3. **Check Redis**: `KEYS sess:*` → Should see **2 sessions**

### Method 3: Different Devices

1. **Laptop**: Login as User1
2. **Phone**: Login as User2
3. **Check Redis**: `KEYS sess:*` → Should see **2 sessions**

## 🔍 Inspect Your Current Session

### Check what's in the session:

```bash
# See all sessions with details
node cli/inspect-redis-session.js

# See specific session
node cli/inspect-redis-session.js sess:WQhlACxKNg6sUpnLNC1lxoQ8IHmYsXcc
```

### In Redis CLI:

```bash
redis-cli

# Get all session keys
KEYS sess:*

# Get specific session data
GET sess:WQhlACxKNg6sUpnLNC1lxoQ8IHmYsXcc

# Check expiration time
TTL sess:WQhlACxKNg6sUpnLNC1lxoQ8IHmYsXcc
```

## 📊 Understanding Your Current Situation

If you have:
- **2 tabs open** in the **same browser**
- **Different accounts** logged in
- **Only 1 session** in Redis

**This is correct!** The second login overwrote the first session because they share the same cookie.

## 🧪 Quick Test

To verify multiple sessions work:

1. Open **Chrome** → Login as "host"
2. Open **Firefox** → Login as a different user (or register new user)
3. In Redis: `KEYS sess:*`
4. You should see **2 sessions** now!

## 💡 Why This Happens

```
Browser Cookie Storage:
├── Chrome
│   └── bookconnect_sid = "session-id-123" (shared by ALL tabs)
├── Firefox  
│   └── bookconnect_sid = "session-id-456" (separate cookie)
└── Edge
    └── bookconnect_sid = "session-id-789" (separate cookie)
```

Each browser has its own cookie storage, so each browser gets its own session!

## ✅ Summary

- **Same browser tabs = Same session** (this is normal!)
- **Different browsers = Different sessions**
- **To test multiple sessions, use different browsers**
- **Your Redis is working correctly!** 🎉

