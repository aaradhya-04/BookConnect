# MongoDB Database Setup Guide

## Step 1: Create the Database Structure

MongoDB automatically creates databases and collections when you first insert data. The models I've created define the structure, but you need to either:

**Option A: Run the Migration Script** (if you have existing MySQL data)
```bash
node cli/migrate-to-mongodb.js
```

**Option B: Start Using the App** (if starting fresh)
Just switch to MongoDB models and start using the app - it will create everything automatically!

## Step 2: Switch to MongoDB Models

```bash
# Backup your current MySQL models
mv models models-mysql-backup
mv db.js db-mysql-backup.js

# Use MongoDB versions
mv models-mongo models
mv db-mongo.js db.js
```

## Step 3: Update server.js

Add MongoDB connection at the start of your `start()` function:

```javascript
const { connectMongoDB } = require('./db');

async function start() {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    
    // ... rest of your code
  }
}
```

## Step 4: View Your Database

### Using MongoDB Compass (GUI - Easiest!)

1. **Open MongoDB Compass**
2. **Connect:** Click "Connect" or enter: `mongodb://localhost:27017`
3. **Select Database:** Click on `book_connect` in the left sidebar
4. **View Collections:**
   - `users` - All user accounts
   - `books` - All books
   - `reviews` - All reviews

5. **View Documents:**
   - Click on any collection name
   - You'll see all documents (records) in that collection
   - Click on a document to see its full details

### Using MongoDB Shell (mongosh)

```bash
# Open MongoDB shell
mongosh

# List all databases
show dbs

# Switch to your database
use book_connect

# List all collections (tables)
show collections

# View all users
db.users.find().pretty()

# View all books
db.books.find().pretty()

# View all reviews
db.reviews.find().pretty()

# Count documents
db.users.countDocuments()
db.books.countDocuments()
db.reviews.countDocuments()

# Find specific user by email
db.users.findOne({ email: "user@example.com" })

# Find books with views > 10
db.books.find({ views: { $gt: 10 } }).pretty()

# Exit shell
exit
```

## Database Structure

Your MongoDB database `book_connect` will have 3 collections:

### 1. `users` Collection
```javascript
{
  _id: ObjectId("..."),
  username: "john_doe",
  email: "john@example.com",
  password_hash: "$2b$10$...",
  createdAt: ISODate("2024-01-15T10:00:00Z"),
  updatedAt: ISODate("2024-01-15T10:00:00Z")
}
```

### 2. `books` Collection
```javascript
{
  _id: ObjectId("..."),
  title: "Rich Dad Poor Dad",
  authors: "Robert Kiyosaki",
  isbn: "978-0-446-67745-0",
  cover_url: "/uploads/cover.jpg",
  views: 42,
  createdAt: ISODate("2024-01-15T10:00:00Z"),
  updatedAt: ISODate("2024-01-15T10:00:00Z")
}
```

### 3. `reviews` Collection
```javascript
{
  _id: ObjectId("..."),
  user_id: "507f1f77bcf86cd799439011",
  book_id: "507f191e810c19729de860ea",
  rating: 5,
  content: "Great book!",
  createdAt: ISODate("2024-01-15T10:00:00Z"),
  updatedAt: ISODate("2024-01-15T10:00:00Z")
}
```

## Quick Verification Commands

After migration or first use, verify everything:

```bash
mongosh

use book_connect

# Check all collections exist
show collections

# Should show: users, books, reviews

# Check data counts
db.users.countDocuments()
db.books.countDocuments()
db.reviews.countDocuments()

# View sample data
db.users.findOne()
db.books.findOne()
db.reviews.findOne()
```

## Troubleshooting

### Database not showing in Compass?
- Make sure MongoDB is running
- Check connection string: `mongodb://localhost:27017`
- Try refreshing Compass

### Collections empty?
- Run the migration script: `node cli/migrate-to-mongodb.js`
- Or start using the app (login, add books, etc.)

### Can't connect?
- Check MongoDB service is running
- Windows: Services → MongoDB
- Mac: `brew services list`
- Linux: `sudo systemctl status mongod`

