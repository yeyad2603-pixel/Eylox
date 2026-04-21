/* ============================================================
   EYLOX — Express Server  (Milestone 4 — MongoDB)
   ============================================================ */

'use strict';

require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const path      = require('path');

const connectDB    = require('./config/db');
const authRoute    = require('./routes/auth');
const usersRoute   = require('./routes/users');
const gamesRoute   = require('./routes/games');
const friendsRoute = require('./routes/friends');
const ratingsRoute = require('./routes/ratings');
const leaderboardsRoute = require('./routes/leaderboards');
const achievementsRoute = require('./routes/achievements');
const messagesRoute = require('./routes/messages');
const communitiesRoute = require('./routes/communities');
const notificationsRoute = require('./routes/notifications');
const marketplaceRoute = require('./routes/marketplace');
const tradesRoute = require('./routes/trades');
const eventsRoute = require('./routes/events');
const aiRoute = require('./routes/ai');
const youtubeRoute = require('./routes/youtube');
const evolutionRoute = require('./routes/evolution');

const app  = express();
const PORT = process.env.PORT || 3001;

/* ── Middleware ── */
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:5500', 'http://localhost:5500', 'null'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Serve all frontend folders as static files (HTML, CSS, JS merged) */
app.use(express.static(path.join(__dirname, '../Eylox Web html')));
app.use(express.static(path.join(__dirname, '../Eylox WEB js')));
app.use(express.static(path.join(__dirname, '../Eylox WEB Css')));
app.use(express.static(path.join(__dirname, '..')));  /* root assets (images etc) */

/* ── Root → landing page ── */
app.get('/', (_req, res) => res.redirect('/landing.html'));

/* ── API Routes ── */
app.use('/api/auth',    authRoute);
app.use('/api/users',   usersRoute);
app.use('/api/games',   gamesRoute);
app.use('/api/friends', friendsRoute);
app.use('/api/ratings', ratingsRoute);
app.use('/api/leaderboards', leaderboardsRoute);
app.use('/api/achievements', achievementsRoute);
app.use('/api/messages', messagesRoute);
app.use('/api/communities', communitiesRoute);
app.use('/api/notifications', notificationsRoute);
app.use('/api/marketplace', marketplaceRoute);
app.use('/api/trades', tradesRoute);
app.use('/api/events', eventsRoute);
app.use('/api/ai', aiRoute);
app.use('/api/youtube', youtubeRoute);
app.use('/api/evolution', evolutionRoute);

/* ── Health check ── */
app.get('/api/health', (req, res) => {
  res.json({
    status:  'ok',
    message: '🎮 Eylox API is running!',
    version: '4.0.0',
    time:    new Date().toISOString(),
  });
});

/* ── 404 handler for unknown API routes ── */
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

/* ── Global error handler ── */
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

/* ── Boot ── */
async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log('');
    console.log('  🎮  EYLOX API SERVER  (MongoDB edition)');
    console.log('  ─────────────────────────────────────────');
    console.log(`  ✅  Running at   http://localhost:${PORT}`);
    console.log(`  🌐  Frontend at  http://localhost:${PORT}/landing.html`);
    console.log('');
    console.log('  Tip: run "npm run seed" first to populate the database.');
    console.log('  ─────────────────────────────────────────');
    console.log('');
  });
}

start();
