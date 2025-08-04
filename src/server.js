const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Import route modules
const productRoutes = require('./routes/products.routes');
const usersRoutes = require('./routes/users.routes');
const quotesRoutes = require('./routes/quotes.routes');
const policiesRoutes = require('./routes/policies.routes');
const claimsRoutes = require('./routes/claims.routes');
const clientsRoutes = require('./routes/clients.routes');

// Register route modules
console.log('Registering routes...');
app.use('/api/products', productsRoutes);
console.log('✅ Registered /api/products');

app.use('/api/users', usersRoutes);
console.log('✅ Registered /api/users');

app.use('/api/quotes', quotesRoutes);
console.log('✅ Registered /api/quotes');

app.use('/api/policies', policiesRoutes);
console.log('✅ Registered /api/policies');

app.use('/api/claims', claimsRoutes);
console.log('✅ Registered /api/claims');

app.use('/api/clients', clientsRoutes);
console.log('✅ Registered /api/clients');

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
