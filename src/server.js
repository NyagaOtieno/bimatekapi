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
 * Safe import: resolves module and ensures it's an Express router
 */
const safeImportRouter = (routePath) => {
  try {
    const module = require(routePath);

    // If the module itself is a router, return it
    if (module && typeof module === 'function' && module.stack) return module;

    // If it's exported as default or named router
    if (module.default && typeof module.default === 'function' && module.default.stack) return module.default;
    if (module.router && typeof module.router === 'function' && module.router.stack) return module.router;

    console.error(`❌ Module at ${routePath} is not an Express router`);
    return null;
  } catch (err) {
    console.error(`❌ Failed to load route: ${routePath}`, err.message);
    return null;
  }
};

const routes = [
  { path: '/api/products', handler: safeImportRouter('./routes/products.routes') },
  { path: '/api/users', handler: safeImportRouter('./routes/users.routes') },
  { path: '/api/quotes', handler: safeImportRouter('./routes/quotes.routes') },
  { path: '/api/policies', handler: safeImportRouter('./routes/policies.routes') },
  { path: '/api/claims', handler: safeImportRouter('./routes/claims.routes') },
  { path: '/api/clients', handler: safeImportRouter('./routes/clients.routes') },
];

// Register available routes
routes.forEach(route => {
  if (route.handler) {
    app.use(route.path, route.handler);
    console.log(`✅ Registered ${route.path}`);
  } else {
    console.warn(`⚠️ Skipped ${route.path} (not a valid router)`);
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
