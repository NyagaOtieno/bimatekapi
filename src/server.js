// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan'); // optional: HTTP request logger
const path = require('path');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Validate required environment variables
const PORT = process.env.PORT || 3000;

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // logs requests (optional)

// Safe router import
const safeImportRouter = (routePath) => {
  try {
    const mod = require(routePath);

    if (mod && typeof mod === 'function' && mod.stack) return mod; // router exported directly
    if (mod.default && typeof mod.default === 'function' && mod.default.stack) return mod.default;
    if (mod.router && typeof mod.router === 'function' && mod.router.stack) return mod.router;

    console.error(`❌ Module at ${routePath} is not an Express router`);
    return null;
  } catch (err) {
    console.error(`❌ Failed to load route: ${routePath}`, err.message);
    return null;
  }
};

// Route definitions
const routes = [
  { path: '/api/products', file: './routes/products.routes' },
  { path: '/api/users', file: './routes/users.routes' },
  { path: '/api/quotes', file: './routes/quotes.routes' },
  { path: '/api/policies', file: './routes/policies.routes' },
  { path: '/api/claims', file: './routes/claims.routes' },
  { path: '/api/clients', file: './routes/clients.routes' },
];

// Register routes
routes.forEach(({ path, file }) => {
  const router = safeImportRouter(file);
  if (router) {
    app.use(path, router);
    console.log(`✅ Registered route: ${path}`);
  } else {
    console.warn(`⚠️ Skipped route: ${path}`);
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API is running',
    endpoints: routes.map((r) => r.path),
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
