const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Route imports
app.use('/api/products', require('./src/routes/products.routes'));
app.use('/api/users', require('./src/routes/users.routes'));
app.use('/api/quotes', require('./src/routes/quotes.routes'));
app.use('/api/policies', require('./src/routes/policies.routes'));
app.use('/api/claims', require('./src/routes/claims.routes'));
app.use('/api/clients', require('./src/routes/clients.routes'));

// 👇 Add this to show status at "/"
app.get('/', (req, res) => {
  res.send('✅ Bimatek API is running. Use /api/* endpoints.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
