require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

const app = express();

// In production the backend serves the frontend (same origin), CORS is only needed for dev
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? true  // allow all — same-origin in production
  : (process.env.FRONTEND_URL || 'http://localhost:5173');

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', taskRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
// Bind to 0.0.0.0 so Railway's reverse proxy can reach the server
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`));
