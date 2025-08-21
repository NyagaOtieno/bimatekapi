// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
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
app.use(morgan('dev')); // logs requests

// ========================
// Route definitions
// ========================
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
  try {
    const router = require(file);
    // Ensure the router is a function (Express Router)
    if (!router || typeof router !== 'function') {
      throw new Error('Exported module is not an Express router');
    }
    app.use(path, router);
    console.log(`✅ Registered route: ${path}`);
  } catch (err) {
    console.error(`⚠️ Failed to load route ${path} from ${file}:`, err.message);
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
