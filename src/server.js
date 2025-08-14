const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import route modules
const productsRoutes = require('./routes/products.routes');
const usersRoutes = require('./routes/users.routes');
const quotesRoutes = require('./routes/quotes.routes');
const policiesRoutes = require('./routes/policies.routes');
const claimsRoutes = require('./routes/claims.routes');
const clientsRoutes = require('./routes/clients.routes');

// Register route modules
const routes = [
  { path: '/api/products', handler: productsRoutes },
  { path: '/api/users', handler: usersRoutes },
  { path: '/api/quotes', handler: quotesRoutes },
  { path: '/api/policies', handler: policiesRoutes },
  { path: '/api/claims', handler: claimsRoutes },
  { path: '/api/clients', handler: clientsRoutes },
];

routes.forEach(route => {
  app.use(route.path, route.handler);
  console.log(`✅ Registered ${route.path}`);
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
