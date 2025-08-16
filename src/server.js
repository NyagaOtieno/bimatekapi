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

// Import route modules safely
const safeImport = (routePath) => {
  try {
    return require(routePath);
  } catch (err) {
    console.error(`❌ Failed to load route: ${routePath}`, err.message);
    return null;
  }
};

const routes = [
  { path: '/api/products', handler: safeImport('./routes/products.routes') },
  { path: '/api/users', handler: safeImport('./routes/users.routes') },
  { path: '/api/quotes', handler: safeImport('./routes/quotes.routes') },
  { path: '/api/policies', handler: safeImport('./routes/policies.routes') },
  { path: '/api/claims', handler: safeImport('./routes/claims.routes') },
  { path: '/api/clients', handler: safeImport('./routes/clients.routes') },
];

// Register available routes
routes.forEach(route => {
  if (route.handler) {
    app.use(route.path, route.handler);
    console.log(`✅ Registered ${route.path}`);
  } else {
    console.warn(`⚠️ Skipped ${route.path} (module not found)`);
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
