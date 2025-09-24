require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Initialize express app
const app = express();

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Session store in MySQL
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

app.use(
  session({
    key: 'bookconnect_sid',
    secret: process.env.SESSION_SECRET || 'dev_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 hours
  })
);

// Expose current user to EJS templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/reviews', reviewRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack); // shows call stack
  if (req.path.startsWith('/api')) {
    // API request -> return JSON
    return res.status(err.status || 500).json({ error: err.message });
  }
  // Web request -> render error page
  res.status(err.status || 500).render('error', { error: err });
});

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION! Shutting down...', reason.stack || reason);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Book Connect running at http://localhost:${PORT}`));

const apiRoutes = require('./routes/apiRoutes');
app.use('/api', apiRoutes);

