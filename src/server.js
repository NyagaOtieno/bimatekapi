const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Safely import route module and ensure it is an Express router
 * @param {string} relativePath - relative path to the route file
 * @returns {Router|null}
 */
const safeImportRouter = (relativePath) => {
  try {
    const modulePath = path.resolve(__dirname, relativePath);
    const router = require(modulePath);

    // Check if module is an Express router
    if (router && (typeof router === 'function' || (typeof router === 'object' && router.stack))) {
      return router;
    }

    console.warn(`⚠️ Module at ${relativePath} is not a valid Express router`);
    return null;
  } catch (err) {
    console.error(`❌ Failed to load route: ${relativePath}`, err.message);
    return null;
  }
};

// Define routes
const routes = [
  { path: '/api/products', file: './routes/products.routes' },
  { path: '/api/users', file: './routes/users.routes' },
  { path: '/api/quotes', file: './routes/quotes.routes' },
  { path: '/api/policies', file: './routes/policies.routes' },
  { path: '/api/claims', file: './routes/claims.routes' },
  { path: '/api/clients', file: './routes/clients.routes' },
];

// Register routes
routes.forEach(route => {
  const router = safeImportRouter(route.file);
  if (router) {
    app.use(route.path, router);
    console.log(`✅ Registered ${route.path}`);
  } else {
    console.warn(`⚠️ Skipped ${route.path} (router not found or invalid)`);
  }
});

// Default route
app.get('/', (req, res) => {
  res.json({ message: '🚀 API is running', endpoints: routes.map(r => r.path) });
});

// Handle unknown endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
